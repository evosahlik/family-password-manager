const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const itemTypeId = decodeURIComponent(event.pathParameters?.itemTypeId || '');
    const body = JSON.parse(event.body || '{}');

    if (!itemTypeId) {
      return response(400, { error: 'itemTypeId path parameter is required' });
    }

    if (!body.encryptedData) {
      return response(400, { error: 'encryptedData is required' });
    }

    const now = new Date().toISOString();

    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { userId, itemTypeId },
      UpdateExpression: 'SET encryptedData = :ed, iv = :iv, updatedAt = :ua',
      ConditionExpression: 'attribute_exists(userId)',
      ExpressionAttributeValues: {
        ':ed': body.encryptedData,
        ':iv': body.iv || null,
        ':ua': now,
      },
    }));

    return response(200, { itemTypeId, updatedAt: now });

  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return response(404, { error: 'Item not found' });
    }
    console.error('updateEntry error:', err);
    return response(500, { error: 'Internal server error' });
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
