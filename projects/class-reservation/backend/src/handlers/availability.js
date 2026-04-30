import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { getAvailableSlots } from '../utils/scheduling.js';

export default async function availabilityHandler(event, context) {
  const { docClient, tables } = context;

  if (event.httpMethod === 'GET' && event.path === '/availability') {
    return await getAvailability(event, docClient, tables);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Not Found' }),
  };
}

async function getAvailability(event, docClient, tables) {
  try {
    const queryParams = event.queryStringParameters || {};
    const startDate = queryParams.startDate ? new Date(queryParams.startDate) : new Date();
    const endDate = queryParams.endDate 
      ? new Date(queryParams.endDate) 
      : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Get all sessions in date range
    const sessionsResult = await docClient.send(
      new ScanCommand({
        TableName: tables.sessions,
        FilterExpression: '#startTime BETWEEN :start AND :end AND #status = :status',
        ExpressionAttributeNames: {
          '#startTime': 'startTime',
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':start': startDate.toISOString(),
          ':end': endDate.toISOString(),
          ':status': 'scheduled',
        },
      })
    );

    // Get all group classes in date range
    const groupClassesResult = await docClient.send(
      new ScanCommand({
        TableName: tables.groupClasses,
        FilterExpression: '#startTime BETWEEN :start AND :end',
        ExpressionAttributeNames: {
          '#startTime': 'startTime',
        },
        ExpressionAttributeValues: {
          ':start': startDate.toISOString(),
          ':end': endDate.toISOString(),
        },
      })
    );

    // Get blocked availability
    const availabilityResult = await docClient.send(
      new ScanCommand({
        TableName: tables.availability,
        FilterExpression: '#startTime BETWEEN :start AND :end AND #type = :type',
        ExpressionAttributeNames: {
          '#startTime': 'startTime',
          '#type': 'type',
        },
        ExpressionAttributeValues: {
          ':start': startDate.toISOString(),
          ':end': endDate.toISOString(),
          ':type': 'blocked',
        },
      })
    );

    // Calculate available slots
    const availableSlots = getAvailableSlots(
      startDate,
      endDate,
      sessionsResult.Items || [],
      groupClassesResult.Items || [],
      availabilityResult.Items || []
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        availableSlots,
        bookedSessions: (sessionsResult.Items || []).map(s => ({
          startTime: s.startTime,
          endTime: s.endTime,
          location: s.location,
        })),
        groupClasses: (groupClassesResult.Items || []).map(gc => ({
          classId: gc.classId,
          startTime: gc.startTime,
          endTime: gc.endTime,
          location: gc.location,
          capacity: gc.maxCapacity,
          enrolled: gc.studentIds?.length || 0,
        })),
      }),
    };
  } catch (error) {
    console.error('Error getting availability:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get availability' }),
    };
  }
}
