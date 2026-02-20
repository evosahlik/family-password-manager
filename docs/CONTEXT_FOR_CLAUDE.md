# Password Manager Project - Context for Claude

## Project Overview
Building a zero-knowledge password manager using AWS serverless architecture as part of AWS Solutions Architect Associate certification preparation.

## Current Status (as of Feb 15, 2026)
- **Sprint**: Sprint 1 (Authentication) - ~40% complete
- **Next Task**: Deploy to AWS (S3, CloudFormation, SSL certificate)
- **Timeline**: Started Feb 10, targeting May 4 completion (12 weeks total)

## Key Technical Details
- **AWS Region**: us-east-1
- **Cognito User Pool ID**: us-east-1_XLGNUlZkM
- **Cognito Client ID**: 593903apijinant9porklfp39c
- **Tech Stack**: React, Node.js, DynamoDB, Lambda, API Gateway, Cognito, S3, CloudFront
- **Encryption**: Client-side AES-256-GCM with PBKDF2 key derivation (100K iterations)

## Completed Work
### Sprint 0 (Foundation)
- ✅ GitHub repo created
- ✅ Development environment set up (Node.js, AWS CLI, React)
- ✅ Architecture diagram created
- ✅ Web Crypto API tested

### Sprint 1 (Authentication)
- ✅ Cognito User Pool created and configured
- ✅ React app with Login, Register, Dashboard pages
- ✅ React Router configured
- ✅ End-to-end authentication tested (register → verify → login → dashboard)

## What's NOT Done Yet
- Domain registration (may or may not be done - need to check)
- CloudFormation infrastructure deployment
- S3 static website hosting
- CloudFront CDN setup
- SSL certificate via ACM
- Route 53 DNS configuration
- DynamoDB table creation
- Lambda functions
- API Gateway
- Encryption implementation in production
- Password CRUD UI

## Important Files
- Project root: `E:\Projects\family-password-manager\`
- React app: `E:\Projects\family-password-manager\frontend\password-manager-ui\`
- Config: `src/config.js` (has Cognito IDs)
- Auth utilities: `src/utils/auth.js`
- Daily task breakdown: `docs/sprint-daily-tasks.md` and `docs/sprint-daily-tasks-continued.md`

## Known Issues Resolved
- Fixed `react-scripts` version issue (was `^0.0.0`, now `5.0.1`)
- Enabled `ALLOW_USER_SRP_AUTH` in Cognito app client
- Removed extra required attributes from Cognito (only email required now)

## Constraints & Preferences
- **Budget**: Target $25/year AWS costs
- **Time**: 1 hour/day weekdays, 2 hours weekends
- **ADHD-friendly approach**: Need detailed step-by-step instructions with clear deliverables
- **Learning goals**: AWS SSA certification preparation, cloud consulting portfolio piece
- **Family use case**: 5 users, ~100 passwords total

## Architecture Decisions
- **Client-side encryption** (zero-knowledge) vs AWS Secrets Manager (chose client-side for cost)
- **Individual vaults + manual sharing** vs shared vault (chose individual for Phase 1 simplicity)
- **CloudFormation** vs SAM (chose CloudFormation for exam relevance, willing to switch to SAM if behind schedule)
- **Node.js Lambda** vs Python (chose Node.js to match React frontend)
- **DynamoDB on-demand** vs RDS (chose DynamoDB for cost: $0.40/mo vs $15/mo)

## Next Session Goals
Pick up at Sprint 1 deployment tasks:
1. Register domain (if not done)
2. Create CloudFormation template for S3 hosting
3. Deploy stack
4. Upload React build to S3
5. Request SSL certificate
6. Validate certificate via Route 53

## Questions to Ask New Claude
"I'm building a password manager with AWS. I've completed authentication (Cognito working with React). Next I need to deploy to S3 with CloudFormation. Here's my context file: [attach this file]. Ready to continue from Sprint 1 deployment?"
## Current Status (as of Feb 16, 2026)
- **Sprint**: Sprint 1 COMPLETE, ready for Sprint 2
- **Live URL**: https://vosahlik-vault.com
- **Next Task**: Implement client-side encryption (crypto.js module)
- **Timeline**: 2 weeks ahead of schedule (completed 3 weeks in 2 days)