const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { randomUUID } = require('crypto');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const body = JSON.parse(event.body || '{}');

    if (!body.itemType || !body.encryptedData) {
      return response(400, { error: 'itemType and encryptedData are required' });
    }

    const itemId = randomUUID();
    const itemTypeId = `${body.itemType}#${itemId}`;
    const now = new Date().toISOString();

    const item = {
      userId,
      itemTypeId,
      itemType: body.itemType,
      encryptedData: body.encryptedData,
      iv: body.iv || null,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }));

    return response(201, { itemTypeId, createdAt: now });

  } catch (err) {
    console.error('createEntry error:', err);
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
