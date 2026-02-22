const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event));
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const { itemTypeId } = event.pathParameters || {};
    if (!itemTypeId) return response(400, { message: "Missing path parameter: itemTypeId" });

    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { userId, itemTypeId: decodeURIComponent(itemTypeId) },
    }));

    return response(200, { message: "Entry deleted" });
  } catch (err) {
    console.error("Error:", err);
    return response(500, { message: "Internal server error" });
  }
};

const response = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
