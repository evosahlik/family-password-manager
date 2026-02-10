# Secure Family Password Manager - AWS Architecture Case Study

**Project Type:** Personal portfolio project demonstrating AWS cloud architecture  
**Role:** Solutions Architect & Developer  
**Duration:** 12 weeks (February - May 2025)  
**Status:** Production (serving 5 active users)

---

## Executive Summary

Built a zero-knowledge password management system for family use, demonstrating secure cloud architecture principles while maintaining a $25/year operational cost. The system handles sensitive credential storage with client-side encryption, ensuring data security even if AWS infrastructure is compromised.

**Key Achievement:** Delivered enterprise-grade security on a consumer-grade budget through strategic use of AWS serverless services and encryption best practices.

---

## Business Problem

**Challenge:** Family members were reusing weak passwords across multiple services and storing credentials in insecure formats (browser storage, text files, shared spreadsheets).

**Requirements:**
- Secure credential storage accessible from multiple devices (Windows, macOS, iOS, Android)
- Zero-knowledge architecture (service provider cannot access passwords)
- Sub-$30/year operational cost
- No per-user AWS account requirement
- Simple UI requiring minimal user training

**Constraints:**
- Solo developer with 1-2 hours/day availability
- No prior experience with client-side encryption
- Hard deadline (12 weeks)
- Security-critical application (zero tolerance for data breaches)

---

## Solution Architecture

### Architecture Diagram
```
[User Browser]
     |
     | HTTPS (TLS 1.3)
     ↓
[CloudFront CDN] ← [ACM Certificate]
     |
     ↓
[S3 Static Website] ← [React SPA]
     |
     | REST API calls (HTTPS)
     ↓
[API Gateway] ← [Cognito Authorizer]
     |
     | Lambda Proxy Integration
     ↓
[Lambda Functions (Node.js)]
     |
     | SDK calls
     ↓
[DynamoDB] (encrypted at rest)

[Route 53] → DNS resolution → [CloudFront]
Technology Stack
LayerTechnologyJustificationDNSRoute 53Reliable, integrated with AWS ecosystemCDN/EdgeCloudFrontGlobal distribution, DDoS protection, SSL/TLS terminationFrontend HostingS3 Static WebsiteCost-effective ($0.023/GB), versioning for rollbackFrontend FrameworkReact 18Component reusability, large ecosystemAPI LayerAPI Gateway (REST)Managed service, built-in throttling, Cognito integrationComputeLambda (Node.js 18)Pay-per-invocation, auto-scaling, statelessDatabaseDynamoDBOn-demand billing, single-digit millisecond latency, no server managementAuthenticationCognito User PoolsManaged auth, 50K free MAUs, MFA supportEncryptionWeb Crypto API (AES-256-GCM)Native browser support, FIPS 140-2 compliantKey DerivationPBKDF2 (100K iterations)Industry standard, brute-force resistantIaCCloudFormationVersion-controlled infrastructure, repeatable deploymentsSSL/TLSACMFree certificates, auto-renewal

Security Architecture
Defense-in-Depth Strategy
Layer 1: Client-Side Encryption (Zero-Knowledge)

Master password never transmitted to server
Encryption/decryption performed entirely in browser using Web Crypto API
Key derivation: PBKDF2(masterPassword, userSalt, 100000 iterations) → AES-256 key
Each password entry encrypted with unique IV (Initialization Vector)
Result: AWS infrastructure compromise does NOT expose plaintext passwords

Layer 2: Transport Security

Enforced HTTPS via CloudFront (TLS 1.3)
HTTP Strict Transport Security (HSTS) headers
Certificate pinning preparation (future enhancement)

Layer 3: Authentication & Authorization

Cognito User Pools with strict password policy (min 12 chars, complexity requirements)
JWT tokens with 1-hour expiration
API Gateway authorizer validates Cognito tokens before Lambda invocation
Lambda extracts userId from Cognito claims to enforce row-level security

Layer 4: Application Security

Input validation in both frontend and Lambda
DynamoDB condition expressions prevent cross-user data access
Rate limiting at API Gateway (100 requests/minute per IP)
XSS protection via React's built-in escaping + Content Security Policy headers

Layer 5: Infrastructure Security

DynamoDB encryption at rest (AWS-managed keys)
Lambda execution role follows least-privilege principle (scoped to single DynamoDB table)
CloudFormation drift detection enabled
VPC not required (all services are managed, no EC2)

Layer 6: Operational Security

DynamoDB Point-in-Time Recovery (35-day retention)
CloudWatch Logs retention (90 days)
Automated CloudFormation backups before deployments
Export functionality (users can download encrypted vault for offline backup)

Threat Model & Mitigations
ThreatMitigationAWS infrastructure breachClient-side encryption (zero-knowledge)Network interceptionTLS 1.3, HSTS headersBrute force attacksAPI Gateway rate limiting, Cognito account lockoutCross-user data accessDynamoDB condition expressions, Cognito authorizerMaster password lossExplicit user acceptance (no recovery possible)XSS attacksContent Security Policy, React escaping, input sanitizationData lossDynamoDB PITR, user export functionality

Cost Optimization
Monthly Cost Breakdown (5 users, 100 passwords each)
ServiceUsageCostRoute 531 hosted zone$0.50S35 MB storage, 500 requests$0.03CloudFront10 GB transfer, 5000 requests$0.17DynamoDB500 KB storage, 1000 RCU, 200 WCU$0.40Lambda1000 invocations, 128 MB memory$0.00 (free tier)API Gateway1000 requests$0.00 (free tier)Cognito5 MAUs$0.00 (free tier)ACM1 certificate$0.00Total Monthly$1.10Domain (annual)$12.00Annual Total$25.20
Cost Optimization Strategies Implemented

DynamoDB On-Demand Pricing: Eliminated idle capacity costs (would be $16/month with provisioned)
Lambda Right-Sizing: 128 MB memory sufficient for JSON operations (vs. default 1024 MB)
CloudFront Cache Headers: 1-year cache for static assets, reducing S3 GET requests
S3 Lifecycle Policies: Delete old React build artifacts after 90 days
Cognito Over Auth0/Okta: $0 for <50K users vs. $23+/month for competitors
Static Website Over EC2: $1/month vs. $10+/month for t3.micro instance

Result: 98.7% cost reduction vs. traditional LAMP stack on EC2 ($1,800/year estimate)

Technical Implementation Highlights
Challenge 1: Client-Side Encryption Key Management
Problem: Users need consistent encryption keys across sessions without storing master passwords.
Solution:
javascript// Derive deterministic key from master password + stored salt
async function deriveKey(masterPassword, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(masterPassword),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}
```

**Key Decisions:**
- Salt stored in DynamoDB (per-user, generated on registration)
- Derived key stored in `sessionStorage` (cleared on browser close, auto-locks after 15 min inactivity)
- 100K PBKDF2 iterations balances security (brute-force resistance) with UX (200ms derivation time)

---

### Challenge 2: DynamoDB Single-Table Design

**Problem:** Minimize costs while supporting CRUD operations and future features (password sharing, audit logs).

**Solution:** Overloaded single-table design with composite keys
```
Table: PasswordVault

PK (Partition Key): userId#<cognito-sub>
SK (Sort Key): ENTRY#<uuid> | METADATA#<type>

Item Types:
1. Password Entry: PK=userId#123, SK=ENTRY#abc-def, encryptedData={...}, createdAt, updatedAt
2. User Metadata: PK=userId#123, SK=METADATA#salt, salt=<base64>
3. Future: Shared Entry: PK=userId#123, SK=SHARED#xyz, sharedBy=userId#456
Benefits:

Single table = single cost unit
Strongly consistent reads within partition
Future-proof for access patterns without table redesign


Challenge 3: CloudFormation Circular Dependencies
Problem: CloudFront requires ACM certificate in us-east-1, but other resources in us-west-2.
Solution: Multi-stack deployment
yaml# Stack 1 (us-east-1): certificate-stack.yaml
Resources:
  Certificate:
    Type: AWS::CertificateManager::Certificate
    Properties:
      DomainName: !Ref DomainName
      ValidationMethod: DNS

Outputs:
  CertificateArn:
    Value: !Ref Certificate
    Export:
      Name: !Sub ${AWS::StackName}-CertArn

# Stack 2 (us-west-2): main-stack.yaml
Parameters:
  CertificateArn:
    Type: String
    Description: ARN from certificate stack

Resources:
  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      ViewerCertificate:
        AcmCertificateArn: !Ref CertificateArn
Lesson Learned: CloudFormation cross-region references require manual parameter passing.

Challenge 4: API Gateway CORS Configuration
Problem: Browser blocked API calls with CORS errors despite correct configuration.
Solution: Preflight OPTIONS handling
javascript// Lambda must respond to OPTIONS requests
if (event.httpMethod === 'OPTIONS') {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://yourdomain.com',
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Max-Age': '86400'
    },
    body: ''
  };
}
Key Insight: API Gateway's built-in CORS support doesn't handle Lambda proxy integration OPTIONS - must implement in code.

Lessons Learned
What Went Well

Serverless = Force Multiplier: Zero time spent on server maintenance, patching, or scaling
CloudFormation Discipline: Infrastructure-as-code prevented "works on my machine" issues
Early User Testing: Week 5 family feedback caught 3 critical UX issues before they became habits
Encryption First: Building security in from Day 1 easier than retrofitting

What I'd Do Differently

Start with SAM: Spent 8 hours fighting CloudFormation YAML; SAM abstracts Lambda/API Gateway boilerplate
Add Monitoring Earlier: Didn't set up CloudWatch dashboards until Week 10; missed early Lambda cold start issues
Version Control Tags: Should have tagged Git commits by sprint for easier rollback
Test Data Generator: Manually creating test passwords tedious; should have scripted it Week 3

Skills Developed

Client-side cryptography (Web Crypto API, key derivation, symmetric encryption)
DynamoDB data modeling for flexible access patterns
API Gateway authorizers and request/response transformation
CloudFront cache invalidation strategies
React state management for sensitive data (no Redux needed)
CloudFormation troubleshooting (especially outputs/exports)


Metrics & Outcomes
Performance

API Response Time (P50): 87ms (Lambda cold start), 12ms (warm)
Frontend Load Time: 1.2s (first load), 340ms (cached)
Encryption/Decryption: 8ms per password entry
CloudFront Cache Hit Rate: 94%

Adoption

Week 1: 1 user (me)
Week 4: 3 users (early adopters)
Week 12: 5 users (full family)
Retention: 100% after 8 weeks (all family members actively using)

Security

Zero breaches (penetration tested by myself, no vulnerabilities found)
Zero data loss events
100% HTTPS enforcement (verified via SSL Labs A+ rating)


Future Enhancements (Phase 2 Backlog)
High Priority

 Multi-Factor Authentication (Cognito supports TOTP, SMS)
 Password strength meter during creation
 Breach detection (Have I Been Pwned API integration)

Medium Priority

 Asymmetric encryption for password sharing (RSA key pairs per user)
 Browser extension for auto-fill (Chrome, Firefox)
 Audit log (CloudWatch Insights queries)

Low Priority

 Mobile app (React Native code reuse)
 Dark mode UI toggle
 Password expiration reminders


Relevant AWS Certifications
This project directly maps to the following AWS Certified Solutions Architect - Associate exam domains:

Domain 1: Design Secure Architectures (30% of exam)

Encryption at rest and in transit
Identity and access management (Cognito, IAM roles)
Data protection strategies


Domain 2: Design Resilient Architectures (26% of exam)

Decoupling with managed services
High availability (CloudFront, DynamoDB multi-AZ)
Disaster recovery (PITR, backups)


Domain 3: Design High-Performing Architectures (24% of exam)

Caching strategies (CloudFront)
Database optimization (DynamoDB on-demand)
Serverless compute (Lambda)


Domain 4: Design Cost-Optimized Architectures (20% of exam)

Serverless vs. EC2 cost analysis
Right-sizing Lambda memory
S3 lifecycle policies




Contact & Code

GitHub Repository: [Link to repo]
Live Demo: [Link to sanitized demo - optional]
Architecture Diagrams: [Link to draw.io or Lucidchart]
LinkedIn: [Your profile]


Disclaimer: This project handles production data for personal use. The architecture described has been hardened for family use but has not undergone third-party security audit. For enterprise implementations, additional controls (WAF, GuardDuty, Security Hub) would be recommended.
