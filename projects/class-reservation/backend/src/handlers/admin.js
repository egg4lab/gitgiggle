import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const COACH_SECRET = process.env.COACH_SECRET || 'change-this-secret';

export default async function adminHandler(event, context) {
  const { docClient, tables } = context;

  // Verify coach authorization
  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  if (!authHeader || !authHeader.includes(COACH_SECRET)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized - Coach access only' }),
    };
  }

  if (event.httpMethod === 'POST' && event.path === '/admin/students') {
    return await createStudent(event, docClient, tables.students);
  }

  if (event.httpMethod === 'GET' && event.path === '/admin/students') {
    return await getAllStudents(docClient, tables.students);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Not Found' }),
  };
}

async function createStudent(event, docClient, studentsTable) {
  try {
    const body = JSON.parse(event.body);
    const { name, email, passcode } = body;

    if (!name || !email || !passcode) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Name, email, and passcode are required' }),
      };
    }

    // Validate passcode length (minimum 6 characters)
    if (passcode.length < 6) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Passcode must be at least 6 characters' }),
      };
    }

    const studentId = uuidv4();
    const student = {
      studentId,
      name,
      email,
      passcode, // Store plaintext passcode for simple lookup
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: studentsTable,
        Item: student,
      })
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        student: {
          studentId: student.studentId,
          name: student.name,
          email: student.email,
          passcode: student.passcode,
        },
      }),
    };
  } catch (error) {
    console.error('Error creating student:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create student' }),
    };
  }
}

async function getAllStudents(docClient, studentsTable) {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: studentsTable,
      })
    );

    const students = (result.Items || []).map(s => ({
      studentId: s.studentId,
      name: s.name,
      email: s.email,
      passcode: s.passcode,
      createdAt: s.createdAt,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ students }),
    };
  } catch (error) {
    console.error('Error getting students:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get students' }),
    };
  }
}
