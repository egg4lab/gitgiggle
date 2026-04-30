import { PutCommand, GetCommand, DeleteCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { getStudentFromEvent } from './auth.js';
import { sendCancellationEmail } from '../services/email.js';
import { isTimeSlotAvailable, getLocationForDay } from '../utils/scheduling.js';

export default async function sessionsHandler(event, context) {
  const { docClient, sesClient, tables } = context;

  const student = getStudentFromEvent(event);
  
  // Public endpoints (no auth required for viewing availability)
  if (event.httpMethod === 'GET' && event.path === '/sessions') {
    return await getAllSessions(docClient, tables.sessions);
  }

  // Protected endpoints require authentication
  if (!student) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  if (event.httpMethod === 'POST' && event.path === '/sessions') {
    return await createSession(event, student, docClient, tables);
  }

  if (event.httpMethod === 'GET' && event.path.match(/\/sessions\/student\/[^/]+/)) {
    const studentId = event.pathParameters?.studentId;
    return await getStudentSessions(studentId, student, docClient, tables.sessions);
  }

  if (event.httpMethod === 'DELETE' && event.path.match(/\/sessions\/[^/]+/)) {
    const sessionId = event.pathParameters?.id;
    return await cancelSession(sessionId, student, docClient, sesClient, tables);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Not Found' }),
  };
}

async function getAllSessions(docClient, sessionsTable) {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: sessionsTable,
        FilterExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': 'scheduled',
        },
      })
    );

    // Return sessions without student names (privacy)
    const sessions = result.Items.map(session => ({
      sessionId: session.sessionId,
      startTime: session.startTime,
      endTime: session.endTime,
      location: session.location,
      status: session.status,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ sessions }),
    };
  } catch (error) {
    console.error('Error getting sessions:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get sessions' }),
    };
  }
}

async function createSession(event, student, docClient, tables) {
  try {
    const body = JSON.parse(event.body);
    const { startTime } = body;

    if (!startTime) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Start time is required' }),
      };
    }

    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + 100 * 60 * 1000); // 100 minutes

    // Validate location based on day of week
    const location = getLocationForDay(startDate);
    if (!location) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid day for booking' }),
      };
    }

    // Check if time slot is available
    const available = await isTimeSlotAvailable(
      docClient,
      tables,
      startDate,
      endDate,
      location
    );

    if (!available) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: 'Time slot not available' }),
      };
    }

    // Create session
    const sessionId = uuidv4();
    const session = {
      sessionId,
      studentId: student.studentId,
      studentName: student.name,
      studentEmail: student.email,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      location,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: tables.sessions,
        Item: session,
      })
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        session: {
          sessionId: session.sessionId,
          startTime: session.startTime,
          endTime: session.endTime,
          location: session.location,
        },
      }),
    };
  } catch (error) {
    console.error('Error creating session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create session', message: error.message }),
    };
  }
}

async function getStudentSessions(studentId, requestingStudent, docClient, sessionsTable) {
  // Students can only view their own sessions
  if (studentId !== requestingStudent.studentId) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Forbidden' }),
    };
  }

  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: sessionsTable,
        IndexName: 'student-sessions-index',
        KeyConditionExpression: 'studentId = :studentId',
        ExpressionAttributeValues: {
          ':studentId': studentId,
        },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ sessions: result.Items || [] }),
    };
  } catch (error) {
    console.error('Error getting student sessions:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get sessions' }),
    };
  }
}

async function cancelSession(sessionId, student, docClient, sesClient, tables) {
  try {
    // Get session details
    const result = await docClient.send(
      new GetCommand({
        TableName: tables.sessions,
        Key: { sessionId },
      })
    );

    const session = result.Item;
    if (!session) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Session not found' }),
      };
    }

    // Verify student owns this session
    if (session.studentId !== student.studentId) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Forbidden' }),
      };
    }

    // Check 2-hour advance notice
    const now = new Date();
    const sessionStart = new Date(session.startTime);
    const hoursUntilSession = (sessionStart - now) / (1000 * 60 * 60);

    if (hoursUntilSession < 2) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Cancellation requires 2-hour advance notice',
        }),
      };
    }

    // Update session status
    await docClient.send(
      new PutCommand({
        TableName: tables.sessions,
        Item: {
          ...session,
          status: 'cancelled',
          cancelledAt: now.toISOString(),
        },
      })
    );

    // Send cancellation email
    await sendCancellationEmail(sesClient, session);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Session cancelled successfully',
      }),
    };
  } catch (error) {
    console.error('Error cancelling session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to cancel session' }),
    };
  }
}
