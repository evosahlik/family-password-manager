import os
import boto3
import json
from datetime import datetime
import uuid

# Initialize the DynamoDB client
dynamodb = boto3.resource('dynamodb')
# Get the table name from an environment variable, with a fallback for local testing
TABLE_NAME = os.environ.get('TABLE_NAME', 'dev-PasswordVault')
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    """
    Main handler for the Lambda function.
    Routes requests based on the HTTP method from API Gateway.
    """
    print(f"Received event: {json.dumps(event)}")

    # For now, we will simulate a 'createPassword' action.
    # In future sprints, we will integrate this with Amazon API Gateway
    # to handle real HTTP requests (e.g., event['httpMethod']).

    # --- Simulation ---
    # This is a sample event for creating a new password entry.
    # We will replace this with actual API Gateway events later.
    simulated_action = 'createPassword'
    simulated_user_id = 'user-123-abc' # This would come from the Cognito authorizer
    simulated_payload = {
        'encryptedData': 'super-secret-encrypted-blob',
        'iv': 'unique-initialization-vector'
    }
    # --- End Simulation ---

    try:
        if simulated_action == 'createPassword':
            # Generate a unique ID for the new password entry
            entry_id = f"ENTRY#{uuid.uuid4()}"
            
            # Prepare the item to be saved in DynamoDB
            item_to_save = {
                'userId': simulated_user_id,
                'itemTypeId': entry_id,
                'encryptedData': simulated_payload['encryptedData'],
                'iv': simulated_payload['iv'],
                'createdAt': datetime.utcnow().isoformat() + 'Z',
                'updatedAt': datetime.utcnow().isoformat() + 'Z',
            }

            # Write the item to the table
            table.put_item(Item=item_to_save)
            
            print(f"Successfully created item: {item_to_save}")

            response = {
                'statusCode': 201, # 201 Created
                'headers': {
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({'message': 'Password entry created successfully', 'entryId': entry_id})
            }
        else:
            # Placeholder for other actions (get, delete, etc.)
            response = {
                'statusCode': 404,
                'body': json.dumps({'message': 'Action not found'})
            }

    except Exception as e:
        print(f"Error: {e}")
        response = {
            'statusCode': 500,
            'body': json.dumps({'message': 'An error occurred', 'error': str(e)})
        }

    return response

# You can add a main block for local testing if you like.
# if __name__ == '__main__':
#     print(lambda_handler({}, {}))

