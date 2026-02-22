# API Design Specification

This document outlines the API contract for the Family Password Manager backend.

### Authentication

All endpoints will be secured using a Cognito User Pools authorizer, which will be implemented in a future sprint. The `userId` for all database operations will be securely extracted from the authorizer's context.

### API Endpoints

| Endpoint | Method | Action | Description |
| :--- | :--- | :--- | :--- |
| `/entries` | `POST` | Create a new password entry. | The request body will contain the encrypted data. |
| `/entries` | `GET` | List all password entries. | Retrieves metadata for all entries belonging to the user. |
| `/entries/{entryId}` | `GET` | Get a single password entry. | Retrieves the full encrypted data for one specific entry. |
| `/entries/{entryId}` | `PUT` | Update a password entry. | The request body will contain the new encrypted data. |
| `/entries/{entryId}` | `DELETE`| Delete a password entry. | Removes the specified entry from the database. |
| `/user/salt` | `GET` | Get user's salt. | Retrieves the user's salt for client-side key derivation. |

