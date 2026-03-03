const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const itemTypeId = decodeURIComponent(event.pathParameters?.itemTypeId || '');

    if (!itemTypeId) {
      return response(400, { error: 'itemTypeId path parameter is required' });
    }

    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { userId, itemTypeId },
      ConditionExpression: 'attribute_exists(userId)',
    }));

    return response(200, { message: 'Item deleted', itemTypeId });

  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return response(404, { error: 'Item not found' });
    }
    console.error('deleteEntry error:', err);
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
