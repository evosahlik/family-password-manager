# Password Manager - Progress Log

## Feb 14-16, 2026: Sprints 0-1 Complete

### What We Built
- **Live URL**: https://vosahlik-vault.com
- **Status**: Authentication working, deployed to production
- **AWS Services**: Cognito, S3, CloudFront, ACM, Route 53

### Completed Features
✅ User registration with email verification  
✅ Login/logout functionality  
✅ Secure HTTPS with custom domain  
✅ Global CDN distribution  
✅ Infrastructure as code (CloudFormation)

### Technical Achievements
- Zero-knowledge encryption architecture designed
- Serverless architecture (no servers to manage)
- 99.99% uptime SLA (CloudFront + S3)
- Sub-$10/year operational cost

### AWS Resources Created
```
Route 53:
  - Hosted zone: vosahlik-vault.com
  - A record pointing to CloudFront

CloudFront:
  - Distribution ID: [from outputs]
  - SSL/TLS certificate (ACM)
  - Origin: S3 bucket

S3:
  - Bucket: password-manager-944508510504
  - Static website hosting enabled
  - Public read access

Cognito:
  - User Pool: us-east-1_XLGNUlZkM
  - App Client: 593903apijinant9porklfp39c
  - Email verification enabled
```

### What's NOT Done Yet
- Password storage (DynamoDB)
- Client-side encryption implementation
- CRUD operations for passwords
- Password generator
- Search/filter functionality
- Browser extension (Phase 2)

### Lessons Learned
1. CloudFormation is verbose but powerful
2. ACM certificates take 5-30 min to validate
3. CloudFront deployments take 15-20 minutes
4. react-scripts version matters (was set to ^0.0.0)
5. YAML indentation is critical

### Time Tracking
- **Planned**: 3 weeks (21 hours)
- **Actual**: 2 days (~6 hours)
- **Efficiency**: 3.5x faster than planned

### Next Session Goals
Sprint 2: Encryption Foundation (9 hours planned)
- Implement PBKDF2 key derivation
- Build AES-GCM encryption utilities
- Master password setup flow
- Unit tests

### Portfolio Value
This project already demonstrates:
- AWS Solutions Architect skills
- Serverless architecture design
- Security best practices (encryption, HTTPS)
- Infrastructure as code
- Cost optimization
- Full-stack development


# Project Changelog (Session with Gemini Enterprise)

## Sprint 3: Database Setup

This sprint focused on creating the backend infrastructure, including the database, IAM role, and the core Lambda function.

### Initial Development & Local Testing (Days 1-5)

- **Day 1**: Finalized the `DYNAMODB_SCHEMA.md` design.
- **Day 2**: Defined the DynamoDB table in a CloudFormation template.
- **Day 3**: Wrote the initial Python code for the Lambda function (`lambda_function.py`).
- **Day 4**: Added the IAM Role and Lambda Function resources to the CloudFormation template.
- **Day 5**: Attempted local testing using `sam local invoke`. This phase was **blocked** by a series of critical AWS CloudShell environment issues:
    - **Template Errors**: Corrected several CloudFormation vs. SAM syntax issues (`CodeUri`, `DeletionPolicy` location, etc.).
    - **Docker Build Failures**: Encountered and resolved architecture mismatches (`arm64` vs. `x86_64`) and critical `no space left on device` errors, proving CloudShell's storage was insufficient.
    - **Conclusion**: The local development tools (`sam local invoke`, `sam build`) were deemed non-viable in the constrained CloudShell environment.

### Manual Cloud Deployment & Final Success (Day 6)

- **Strategy Shift**: Abandoned the CLI-based approach and pivoted to a manual deployment using the AWS Management Console.
- **CloudFormation Success**: Deployed a simplified `template.yaml` containing only the `PasswordVaultTable` and `LambdaExecutionRole`. This completed successfully.
- **Lambda Deployment**:
    1.  Created the `dev-PasswordVaultFunction` manually via the Lambda console.
    2.  Assigned the `dev-PasswordVaultRole` created by CloudFormation.
    3.  Set the `TABLE_NAME` environment variable.
    4.  **Final Troubleshooting**: Encountered a persistent `Unable to import module 'lambda_function'` error, even with direct code pasting.
    5.  **Definitive Solution**: Proved the issue was a broken cache state on the Lambda backend associated with the filename `lambda_function.py`. The issue was resolved by deleting the old file, creating a new file named `main.py`, pasting the code into it, and updating the function's handler to `main.handler`.
- **Sprint 3 Complete**: Successfully executed the function via the Lambda console's test feature, achieving a `statusCode: 201` and verifying that an item was written to the DynamoDB table.

"Hey Claude! Continuing work on my family password manager project. Here's where we are:
Project: Zero-knowledge password manager on AWS serverless stack (React + Node.js + DynamoDB + Lambda + API Gateway + Cognito). Portfolio piece for AWS Solutions Architect Associate cert prep.
Stack situation: Three CloudFormation stacks exist in us-east-1:

family-password-manager-dev — UPDATE_COMPLETE — owns the DynamoDB table (dev-PasswordVault) and likely S3/CloudFront/Cognito from Sprint 1
password-manager-prod — UPDATE_COMPLETE — prod infrastructure
vosahlik-vault — ROLLBACK_COMPLETE (dead, needs deletion) — our failed attempt to create a separate backend stack

The problem we hit: Can't create a new vosahlik-vault stack because family-password-manager-dev already owns the dev-PasswordVault DynamoDB table. Solution is to add the backend resources (Lambda functions, API Gateway, IAM role) directly into the family-password-manager-dev stack instead.
What's built so far:

✅ Sprints 0-1: Auth (Cognito), frontend deployed to S3/CloudFront at https://vosahlik-vault.com
✅ Sprint 2: Client-side AES-256-GCM encryption module complete
🔄 Sprint 3 in progress: DynamoDB table exists, need to add Lambda + API Gateway to family-password-manager-dev stack

Four Node.js Lambda functions are written and ready (createEntry, listEntries, updateEntry, deleteEntry) using AWS SDK v3, extracting userId from Cognito JWT claims via event.requestContext.authorizer.jwt.claims.sub.
Next step: Delete dead vosahlik-vault stack, then update family-password-manager-dev template to add Lambda functions, API Gateway, Cognito authorizer, and routes. Please attach the current template.yaml file when starting."**
