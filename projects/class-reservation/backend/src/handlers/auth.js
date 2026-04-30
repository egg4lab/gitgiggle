import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function authHandler(event, context) {
  const { docClient, tables } = context;

  if (event.path === '/auth/login' && event.httpMethod === 'POST') {
    return await handleLogin(event, docClient, tables.students);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Not Found' }),
  };
}

async function handleLogin(event, docClient, studentsTable) {
  try {
    const body = JSON.parse(event.body);
    const { passcode } = body;

    if (!passcode) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Passcode is required' }),
      };
    }

    // Query student by passcode using GSI
    const result = await docClient.send(
      new QueryCommand({
        TableName: studentsTable,
        IndexName: 'passcode-index',
        KeyConditionExpression: 'passcode = :passcode',
        ExpressionAttributeValues: {
          ':passcode': passcode,
        },
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid passcode' }),
      };
    }

    const student = result.Items[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        studentId: student.studentId,
        name: student.name,
        email: student.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        token,
        student: {
          studentId: student.studentId,
          name: student.name,
          email: student.email,
        },
      }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Login failed', message: error.message }),
    };
  }
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function getStudentFromEvent(event) {
  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}
