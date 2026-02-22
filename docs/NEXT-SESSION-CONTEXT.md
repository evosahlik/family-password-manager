# Family Password Manager - Sprint 3 Backend Deployment Context
## Pick up here next session

---

## PROJECT OVERVIEW
- **Project**: Family Password Manager — dual-purpose as a portfolio piece for AWS Solutions Architect Associate cert prep
- **Stack**: React frontend + AWS backend (Cognito auth, DynamoDB, Lambda, API Gateway)
- **Sprint 3 goal**: Deploy backend infrastructure via CloudFormation

---

## AWS ACCOUNT DETAILS
| Resource | Value |
|---|---|
| Account ID | 944508510504 |
| Region | us-east-1 |
| S3 Bucket (frontend + lambda zips) | password-manager-944508510504 |
| ACM Certificate | arn:aws:acm:us-east-1:944508510504:certificate/f06578f1-0a14-4151-900f-ee9597098725 |
| Cognito User Pool | us-east-1_XLGNUlZkM |
| Cognito App Client | 593903apijinant9porklfp39c |

---

## CLOUDFORMATION STACKS (current state)
| Stack | Status | Owns |
|---|---|---|
| `family-password-manager-dev` | UPDATE_ROLLBACK_COMPLETE | DynamoDB table, API Gateway API (id: osz5efgphj), ApiDomain (dev-api.vosahlik-vault.com), ApiMapping, DefaultStage, routes/integrations — BUT NOT the IAM role or Lambda functions |
| `password-manager-prod` | UPDATE_COMPLETE | S3 bucket, CloudFront distribution |

---

## ROOT CAUSE OF ALL FAILURES
The IAM role `dev-PasswordVaultRole` was **manually deleted** earlier in this session (to clean up Gemini's mess). CloudFormation's stack still lists `LambdaExecutionRole` as a managed resource with state `UPDATE` (not `CREATE`), meaning it thinks the role exists and skips recreating it. Then when Lambda functions try to reference the role ARN, IAM returns 404.

**Every single deploy failure has been this same issue.**

The new error in the last attempt adds a second problem:
- `PasswordVaultApi` (id: `osz5efgphj`) returned `Resource was not found (404)` — this API Gateway instance may have also been deleted or drifted.

---

## EXACT NEXT STEPS TO FIX THIS

### Step 1 — Verify what actually exists in AWS right now
Run these three commands before touching anything:

```bash
# Check if IAM role exists
aws iam get-role --role-name dev-PasswordVaultRole --query "Role.Arn" --output text

# Check if API Gateway API still exists
aws apigatewayv2 get-api --api-id osz5efgphj --region us-east-1 --query "Name" --output text

# Check current stack resource states
aws cloudformation list-stack-resources --stack-name family-password-manager-dev --region us-east-1 --query "StackResourceSummaries[*].[LogicalResourceId,ResourceStatus,PhysicalResourceId]" --output table
```

### Step 2 — Decision tree based on results

**If IAM role does NOT exist (most likely):**
```bash
aws iam create-role \
  --role-name dev-PasswordVaultRole \
  --assume-role-policy-document "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"lambda.amazonaws.com\"},\"Action\":\"sts:AssumeRole\"}]}"

aws iam put-role-policy \
  --role-name dev-PasswordVaultRole \
  --policy-name LambdaLoggingPolicy \
  --policy-document "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Action\":[\"logs:CreateLogGroup\",\"logs:CreateLogStream\",\"logs:PutLogEvents\"],\"Resource\":\"arn:aws:logs:*:*:*\"}]}"

aws iam put-role-policy \
  --role-name dev-PasswordVaultRole \
  --policy-name DynamoDBReadWritePolicy \
  --policy-document "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Action\":[\"dynamodb:PutItem\",\"dynamodb:GetItem\",\"dynamodb:UpdateItem\",\"dynamodb:DeleteItem\",\"dynamodb:Query\"],\"Resource\":\"arn:aws:dynamodb:us-east-1:944508510504:table/dev-PasswordVault\"}]}"
```

**If API Gateway API does NOT exist:**
The cleanest path is to delete and recreate the `family-password-manager-dev` stack entirely (DynamoDB table is safe — it has `DeletionPolicy: Retain`).

```bash
aws cloudformation delete-stack --stack-name family-password-manager-dev --region us-east-1
# Wait for deletion to complete (~2 min), then:
aws cloudformation deploy \
  --template-file infrastructure/main-template.yaml \
  --stack-name family-password-manager-dev \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

### Step 3 — If stack deletion is needed, verify DynamoDB table survived
```bash
aws dynamodb describe-table --table-name dev-PasswordVault --region us-east-1 --query "Table.TableStatus"
```
Should return `"ACTIVE"`. The `DeletionPolicy: Retain` in the template means deleting the stack does NOT delete the table.

---

## CURRENT TEMPLATE LOCATION
`E:\Projects\family-password-manager\infrastructure\main-template.yaml`

The clean version of this file was downloaded in this session. Key facts:
- Uses `dev-api.vosahlik-vault.com` as the custom domain (NOT `api.vosahlik-vault.com` — that rename caused replacement failures)
- Has `DependsOn: LambdaExecutionRole` on all 4 Lambda functions
- Lambda zips reference `s3://password-manager-944508510504/lambda/*.zip`

---

## LAMBDA FUNCTION CODE
All four index.js files were created in Notepad and saved to:
- `E:\Projects\family-password-manager\backend\functions\createEntry\index.js`
- `E:\Projects\family-password-manager\backend\functions\listEntries\index.js`
- `E:\Projects\family-password-manager\backend\functions\updateEntry\index.js`
- `E:\Projects\family-password-manager\backend\functions\deleteEntry\index.js`

**Verify zip sizes before deploying** — earlier failures were caused by empty 114-byte zips:
```powershell
dir *.zip
# Each should be several KB (3-10 KB), not 114 bytes
```

If zips need to be regenerated:
```powershell
cd E:\Projects\family-password-manager
Compress-Archive -Path backend\functions\createEntry\* -DestinationPath createEntry.zip -Force
Compress-Archive -Path backend\functions\listEntries\* -DestinationPath listEntries.zip -Force
Compress-Archive -Path backend\functions\updateEntry\* -DestinationPath updateEntry.zip -Force
Compress-Archive -Path backend\functions\deleteEntry\* -DestinationPath deleteEntry.zip -Force

aws s3 cp createEntry.zip s3://password-manager-944508510504/lambda/createEntry.zip
aws s3 cp listEntries.zip s3://password-manager-944508510504/lambda/listEntries.zip
aws s3 cp updateEntry.zip s3://password-manager-944508510504/lambda/updateEntry.zip
aws s3 cp deleteEntry.zip s3://password-manager-944508510504/lambda/deleteEntry.zip
```

---

## AFTER SUCCESSFUL DEPLOYMENT
1. Create Route 53 A record: `dev-api.vosahlik-vault.com` → API Gateway regional domain name
2. Test endpoints with a Cognito JWT token
3. Update React frontend API base URL to `https://dev-api.vosahlik-vault.com`

---

## IMPORTANT NOTES FOR NEXT CLAUDE
- Do NOT use Notepad to edit YAML files — it caused encoding corruption (`ΓöÇ` characters) that broke CloudFormation validation
- Use VS Code or download generated files directly from Claude
- The `password-manager-prod` stack owns the S3 bucket — do not try to include S3/CloudFront in `family-password-manager-dev`
- The DynamoDB table uses `itemTypeId` as sort key (Gemini's naming, kept for compatibility)
