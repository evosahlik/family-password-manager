const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event));
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const body = JSON.parse(event.body || "{}");
    const { encryptedData, iv, label } = body;

    if (!encryptedData || !iv || !label) {
      return response(400, { message: "Missing required fields: encryptedData, iv, label" });
    }

    const itemTypeId = `ENTRY#${randomUUID()}`;
    const now = new Date().toISOString();

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: { userId, itemTypeId, encryptedData, iv, label, createdAt: now, updatedAt: now },
    }));

    return response(201, { message: "Entry created", itemTypeId });
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