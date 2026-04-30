import { ScanCommand } from '@aws-sdk/lib-dynamodb';

export default async function groupClassesHandler(event, context) {
  const { docClient, tables } = context;

  if (event.httpMethod === 'GET' && event.path === '/group-classes') {
    return await getGroupClasses(event, docClient, tables.groupClasses);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Not Found' }),
  };
}

async function getGroupClasses(event, docClient, groupClassesTable) {
  try {
    const queryParams = event.queryStringParameters || {};
    const startDate = queryParams.startDate ? new Date(queryParams.startDate) : new Date();
    const endDate = queryParams.endDate 
      ? new Date(queryParams.endDate) 
      : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const result = await docClient.send(
      new ScanCommand({
        TableName: groupClassesTable,
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

    // Return group classes without student details (privacy)
    const classes = (result.Items || []).map(cls => ({
      classId: cls.classId,
      startTime: cls.startTime,
      endTime: cls.endTime,
      location: cls.location,
      enrolled: cls.studentIds?.length || 0,
      capacity: cls.maxCapacity,
      isFull: (cls.studentIds?.length || 0) >= cls.maxCapacity,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ groupClasses: classes }),
    };
  } catch (error) {
    console.error('Error getting group classes:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get group classes' }),
    };
  }
}
