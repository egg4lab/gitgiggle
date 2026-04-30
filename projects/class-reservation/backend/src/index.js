import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { SESClient } from '@aws-sdk/client-ses';
import authHandler from './handlers/auth.js';
import sessionsHandler from './handlers/sessions.js';
import availabilityHandler from './handlers/availability.js';
import groupClassesHandler from './handlers/groupClasses.js';
import adminHandler from './handlers/admin.js';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sesClient = new SESClient({ region: process.env.AWS_REGION });

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
};

export const handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  const context = {
    docClient,
    sesClient,
    tables: {
      students: process.env.STUDENTS_TABLE,
      sessions: process.env.SESSIONS_TABLE,
      groupClasses: process.env.GROUP_CLASSES_TABLE,
      availability: process.env.AVAILABILITY_TABLE,
    },
  };

  try {
    const path = event.path;
    const method = event.httpMethod;

    let response;

    // Route requests to appropriate handlers
    if (path.startsWith('/auth/')) {
      response = await authHandler(event, context);
    } else if (path.startsWith('/sessions')) {
      response = await sessionsHandler(event, context);
    } else if (path.startsWith('/availability')) {
      response = await availabilityHandler(event, context);
    } else if (path.startsWith('/group-classes')) {
      response = await groupClassesHandler(event, context);
    } else if (path.startsWith('/admin/')) {
      response = await adminHandler(event, context);
    } else {
      response = {
        statusCode: 404,
        body: JSON.stringify({ error: 'Not Found' }),
      };
    }

    return {
      ...response,
      headers: {
        ...corsHeaders,
        ...response.headers,
      },
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
      }),
    };
  }
};
