# DynamoDB Schema Design

## Table: PasswordVault

### Keys
- **Partition Key (PK)**: `userId` (String) - Cognito sub ID
- **Sort Key (SK)**: `itemTypeId` (String) - Composite key (e.g., "METADATA#salt" or "ENTRY#uuid-abc-123")

### Item Types

#### User Metadata (stores salt)
```json
{
  "userId": "cognito-sub-123",
  "itemTypeId": "METADATA#salt",
  "salt": "base64-encoded-salt",
  "createdAt": "2025-03-10T12:00:00Z"
}
