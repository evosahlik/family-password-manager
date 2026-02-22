const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event));
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const { itemTypeId } = event.pathParameters || {};
    if (!itemTypeId) return response(400, { message: "Missing path parameter: itemTypeId" });

    const body = JSON.parse(event.body || "{}");
    const { encryptedData, iv, label } = body;
    if (!encryptedData || !iv || !label) {
      return response(400, { message: "Missing required fields: encryptedData, iv, label" });
    }

    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { userId, itemTypeId: decodeURIComponent(itemTypeId) },
      UpdateExpression: "SET encryptedData = :ed, iv = :iv, #lbl = :lbl, updatedAt = :ua",
      ExpressionAttributeNames: { "#lbl": "label" },
      ExpressionAttributeValues: {
        ":ed": encryptedData,
        ":iv": iv,
        ":lbl": label,
        ":ua": new Date().toISOString(),
      },
    }));

    return response(200, { message: "Entry updated" });
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