# Family Password Manager - Complete Daily Task Breakdown

**Project Duration**: 12 weeks (Feb 10 - May 4, 2025)  
**Daily Commitment**: 1 hour weekdays, 2 hours weekends  
**Target**: Functional password manager with AWS portfolio documentation

---

## Sprint 0: Foundation (Week 1: Feb 10-16)
**Goal**: AWS account setup, domain registration, architecture understanding  
**Total Time**: 7 hours

### Monday, Feb 10 (1 hour) - Domain & Budget Setup

**Tasks:**
1. Log into AWS Console → Route 53
2. Click "Registered domains" → "Register domain"
3. Search for available domain (suggestions: `[familyname]vault.com`, `[familyname]passwords.com`)
4. Register for 1 year (~$12-15 depending on TLD)
5. **While DNS propagates (24-48 hours), set up budgets:**
6. AWS Console → Billing → Budgets → Create budget
   - Budget type: Cost budget
   - Amount: $5/month
   - Alerts: 50%, 80%, 100%
   - Email: your email
7. **Create GitHub repository:**
   - Create repo: `family-password-manager`
   - Add README.md with: Project name, description, tech stack
   - Commit message: "Initial commit: Project setup"

**Deliverable:** Domain registered, budget alerts active, GitHub repo created

**ADHD Tip:** Set a calendar reminder for Wednesday to check domain registration status.

---

### Tuesday, Feb 11 (1 hour) - Environment Setup Part 1

**Tasks:**
1. **Install Node.js:**
   - Download from https://nodejs.org (LTS version, currently 20.x)
   - Verify: `node --version` should show v20.x.x
   - Verify: `npm --version` should show 10.x.x

2. **Install AWS CLI:**
   - Windows: Download MSI installer from AWS
   - Mac: `brew install awscli`
   - Verify: `aws --version`

3. **Configure AWS CLI:**
   ```bash
   aws configure
   # Enter your Access Key ID, Secret Access Key, region (us-west-2), output format (json)
   ```

4. **Create project structure:**
   ```bash
   mkdir family-password-manager
   cd family-password-manager
   mkdir frontend backend infrastructure docs
   ```

**Deliverable:** All tools installed, AWS CLI configured, project folders created

**Troubleshooting:** If AWS CLI credentials don't work, check IAM user has AdministratorAccess (you need this for CloudFormation).

---

### Wednesday, Feb 12 (1 hour) - Architecture Study

**Tasks:**
1. **Watch AWS re:Invent video (30 min):**
   - Search YouTube: "AWS Serverless Architecture Best Practices"
   - Focus on: API Gateway → Lambda → DynamoDB pattern

2. **Draw architecture diagram (30 min):**
   - Use draw.io (free online tool) OR use the SVG I provided
   - Include: Route 53, CloudFront, S3, API Gateway, Lambda, DynamoDB, Cognito
   - Label: HTTPS, authentication flow, data flow
   - Save as `docs/architecture-diagram.svg` (or .png) in your repo

**Deliverable:** Architecture diagram saved, basic understanding of request flow

**Portfolio Tip:** This diagram will be the centerpiece of your documentation. Make it clean.

---

### Thursday, Feb 13 (1 hour) - CloudFormation Template Skeleton

**Tasks:**
1. Create `infrastructure/main-template.yaml`

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Family Password Manager - Main Stack'

Parameters:
  DomainName:
    Type: String
    Description: 'Your registered domain name'
    Default: 'yourdomain.com'  # REPLACE THIS

  Environment:
    Type: String
    Default: 'dev'
    AllowedValues:
      - dev
      - prod

Resources:
  # We'll add resources in upcoming sprints
  # This is just the skeleton for now
  
  PlaceholderBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub '${Environment}-password-manager-placeholder'

Outputs:
  StackName:
    Value: !Ref AWS::StackName
    Description: 'CloudFormation stack name'
```

2. **Test deployment:**
   ```bash
   cd infrastructure
   aws cloudformation create-stack \
     --stack-name password-manager-dev \
     --template-body file://main-template.yaml \
     --parameters ParameterKey=DomainName,ParameterValue=yourdomain.com
   ```

3. **Verify:**
   - AWS Console → CloudFormation → Check stack status (CREATE_COMPLETE)

4. **Delete test stack (we'll recreate properly later):**
   ```bash
   aws cloudformation delete-stack --stack-name password-manager-dev
   ```

**Deliverable:** CloudFormation template created, deployment tested

**Note:** If deployment fails, read the error message carefully. 90% of CloudFormation errors are typos in YAML indentation.

---

### Friday, Feb 14 (1 hour) - React App Initialization

**Tasks:**
1. **Create React app:**
   ```bash
   cd frontend
   npx create-react-app password-manager-ui
   cd password-manager-ui
   ```

2. **Install dependencies you'll need:**
   ```bash
   npm install aws-amplify amazon-cognito-identity-js
   npm install react-router-dom
   ```

3. **Test local development:**
   ```bash
   npm start
   # Browser should open to http://localhost:3000
   # You should see the default React logo spinning
   ```

4. **Create basic folder structure:**
   ```bash
   cd src
   mkdir components pages utils
   ```

5. **Commit to GitHub:**
   ```bash
   git add .
   git commit -m "Initialize React frontend"
   git push
   ```

**Deliverable:** React app running locally, dependencies installed

**ADHD Tip:** Seeing the React logo spin is your dopamine hit for the day. You now have something visual.

---

### Saturday, Feb 15 (2 hours) - Deep Dive Study: Encryption

**Tasks (2 hours):**
1. **Read MDN Web Crypto API docs (1 hour):**
   - https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto
   - Focus on: `deriveBits`, `deriveKey`, `encrypt`, `decrypt`

2. **Watch YouTube tutorial (30 min):**
   - Search: "Web Crypto API tutorial" 
   - Look for one that covers AES-GCM

3. **Code along: Simple encryption test (30 min):**
   ```javascript
   // Create file: frontend/password-manager-ui/src/utils/crypto-test.js
   
   async function testEncryption() {
     const encoder = new TextEncoder();
     const decoder = new TextDecoder();
     
     // Generate a key
     const key = await crypto.subtle.generateKey(
       { name: 'AES-GCM', length: 256 },
       true,
       ['encrypt', 'decrypt']
     );
     
     // Encrypt
     const plaintext = 'Hello, encryption!';
     const iv = crypto.getRandomValues(new Uint8Array(12));
     const ciphertext = await crypto.subtle.encrypt(
       { name: 'AES-GCM', iv: iv },
       key,
       encoder.encode(plaintext)
     );
     
     // Decrypt
     const decrypted = await crypto.subtle.decrypt(
       { name: 'AES-GCM', iv: iv },
       key,
       ciphertext
     );
     
     console.log('Original:', plaintext);
     console.log('Decrypted:', decoder.decode(decrypted));
     console.log('Match:', plaintext === decoder.decode(decrypted));
   }
   
   testEncryption();
   ```

4. **Run it in browser console:**
   - `npm start` (if not already running)
   - Import this file in App.js temporarily
   - Check console for output

**Deliverable:** Understanding of Web Crypto API, test code runs successfully

**Study Tip:** Don't memorize the syntax. You'll reference MDN docs constantly. Just understand the concepts: key derivation, IV randomness, encrypt/decrypt flow.

---

### Sunday, Feb 16 (30 min) - Sprint 0 Check-in

**Checklist:**
- [ ] Domain registered and accessible in Route 53 console
- [ ] AWS Budget alert set up
- [ ] GitHub repo created with README
- [ ] Node.js, AWS CLI installed and working
- [ ] Architecture diagram created
- [ ] CloudFormation template skeleton exists
- [ ] React app runs locally (`npm start` works)
- [ ] Crypto test code runs in browser

**If any item is unchecked:** Spend 30 minutes finishing it. These are foundations for everything else.

**Motivation Check (1-10):** ____

**Next Week Preview:** Sprint 1 = Authentication (Cognito setup, login/register UI, deploy to real domain with HTTPS). By next Sunday, your family will see a login page at your real URL.

---

## Sprint 1: Authentication (Week 2-3: Feb 17-Mar 2)
**Goal**: Users can register and log in  
**Total Time**: 14 hours

### Monday, Feb 17 (1 hour) - Create Cognito User Pool

**Tasks:**
1. AWS Console → Cognito → "Create user pool"
2. **Provider types**: Email (username will be email)
3. **Password policy**: 
   - Minimum length: 12 characters
   - Require: lowercase, uppercase, numbers, special characters
4. **MFA**: Skip for now (Phase 2 feature)
5. **Self-service account recovery**: Enable email recovery
6. **Self-service sign-up**: Enable
7. **Email provider**: Use Cognito (sends 50 emails/day free)
8. **User pool name**: `password-manager-users`
9. **App client**: 
   - Create app client
   - Name: `password-manager-web-app`
   - **Don't generate secret** (for public web apps)
   - Enable auth flows: `ALLOW_USER_PASSWORD_AUTH`, `ALLOW_REFRESH_TOKEN_AUTH`
10. **Save outputs:**
    - User Pool ID (starts with your region, e.g., `us-west-2_ABC123`)
    - App Client ID (long string of random characters)
    - Save these in a text file temporarily

**Deliverable:** Cognito User Pool created with app client

---

### Tuesday, Feb 18 (1 hour) - Cognito Configuration in React

**Tasks:**
1. Create `frontend/password-manager-ui/src/config.js`:
   ```javascript
   const config = {
     cognito: {
       region: 'us-west-2', // Your AWS region
       userPoolId: 'us-west-2_ABC123', // From Monday's task
       userPoolWebClientId: 'abcd1234567890', // From Monday's task
     },
     api: {
       // We'll add this in Sprint 4
       endpoint: ''
     }
   };
   
   export default config;
   ```

2. Create `frontend/password-manager-ui/src/utils/auth.js`:
   ```javascript
   import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
   import config from '../config';
   
   const userPool = new CognitoUserPool({
     UserPoolId: config.cognito.userPoolId,
     ClientId: config.cognito.userPoolWebClientId
   });
   
   export const signUp = (email, password) => {
     return new Promise((resolve, reject) => {
       userPool.signUp(email, password, [], null, (err, result) => {
         if (err) reject(err);
         else resolve(result.user);
       });
     });
   };
   
   export const confirmSignUp = (email, code) => {
     return new Promise((resolve, reject) => {
       const cognitoUser = new CognitoUser({
         Username: email,
         Pool: userPool
       });
       cognitoUser.confirmRegistration(code, true, (err, result) => {
         if (err) reject(err);
         else resolve(result);
       });
     });
   };
   
   export const signIn = (email, password) => {
     return new Promise((resolve, reject) => {
       const authenticationDetails = new AuthenticationDetails({
         Username: email,
         Password: password
       });
       const cognitoUser = new CognitoUser({
         Username: email,
         Pool: userPool
       });
       cognitoUser.authenticateUser(authenticationDetails, {
         onSuccess: (result) => resolve(result),
         onFailure: (err) => reject(err)
       });
     });
   };
   
   export const getCurrentUser = () => {
     return userPool.getCurrentUser();
   };
   
   export const signOut = () => {
     const cognitoUser = userPool.getCurrentUser();
     if (cognitoUser) {
       cognitoUser.signOut();
     }
   };
   ```

**Deliverable:** Auth utilities created and configured

---

### Wednesday, Feb 19 (1 hour) - Build Register Form

**Tasks:**
1. Create `frontend/password-manager-ui/src/pages/Register.js`:
   ```javascript
   import React, { useState } from 'react';
   import { signUp, confirmSignUp } from '../utils/auth';
   
   function Register() {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [confirmPassword, setConfirmPassword] = useState('');
     const [verificationCode, setVerificationCode] = useState('');
     const [needsVerification, setNeedsVerification] = useState(false);
     const [error, setError] = useState('');
     const [success, setSuccess] = useState('');
   
     const handleSignUp = async (e) => {
       e.preventDefault();
       setError('');
       
       if (password !== confirmPassword) {
         setError('Passwords do not match');
         return;
       }
       
       try {
         await signUp(email, password);
         setSuccess('Registration successful! Check your email for verification code.');
         setNeedsVerification(true);
       } catch (err) {
         setError(err.message);
       }
     };
   
     const handleVerify = async (e) => {
       e.preventDefault();
       setError('');
       
       try {
         await confirmSignUp(email, verificationCode);
         setSuccess('Email verified! You can now log in.');
         setTimeout(() => {
           window.location.href = '/login';
         }, 2000);
       } catch (err) {
         setError(err.message);
       }
     };
   
     if (needsVerification) {
       return (
         <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
           <h2>Verify Email</h2>
           <form onSubmit={handleVerify}>
             <div style={{ marginBottom: '15px' }}>
               <label>Verification Code:</label>
               <input
                 type="text"
                 value={verificationCode}
                 onChange={(e) => setVerificationCode(e.target.value)}
                 style={{ width: '100%', padding: '8px' }}
                 required
               />
             </div>
             {error && <p style={{ color: 'red' }}>{error}</p>}
             {success && <p style={{ color: 'green' }}>{success}</p>}
             <button type="submit" style={{ padding: '10px 20px' }}>Verify</button>
           </form>
         </div>
       );
     }
   
     return (
       <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
         <h2>Register</h2>
         <form onSubmit={handleSignUp}>
           <div style={{ marginBottom: '15px' }}>
             <label>Email:</label>
             <input
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               style={{ width: '100%', padding: '8px' }}
               required
             />
           </div>
           <div style={{ marginBottom: '15px' }}>
             <label>Password:</label>
             <input
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               style={{ width: '100%', padding: '8px' }}
               required
             />
           </div>
           <div style={{ marginBottom: '15px' }}>
             <label>Confirm Password:</label>
             <input
               type="password"
               value={confirmPassword}
               onChange={(e) => setConfirmPassword(e.target.value)}
               style={{ width: '100%', padding: '8px' }}
               required
             />
           </div>
           {error && <p style={{ color: 'red' }}>{error}</p>}
           {success && <p style={{ color: 'green' }}>{success}</p>}
           <button type="submit" style={{ padding: '10px 20px' }}>Register</button>
         </form>
       </div>
     );
   }
   
   export default Register;
   ```

**Deliverable:** Registration page functional

---

### Thursday, Feb 20 (1 hour) - Build Login Form

**Tasks:**
1. Create `frontend/password-manager-ui/src/pages/Login.js`:
   ```javascript
   import React, { useState } from 'react';
   import { signIn } from '../utils/auth';
   
   function Login() {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState('');
   
     const handleLogin = async (e) => {
       e.preventDefault();
       setError('');
       
       try {
         await signIn(email, password);
         window.location.href = '/dashboard';
       } catch (err) {
         setError(err.message);
       }
     };
   
     return (
       <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
         <h2>Login</h2>
         <form onSubmit={handleLogin}>
           <div style={{ marginBottom: '15px' }}>
             <label>Email:</label>
             <input
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               style={{ width: '100%', padding: '8px' }}
               required
             />
           </div>
           <div style={{ marginBottom: '15px' }}>
             <label>Password:</label>
             <input
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               style={{ width: '100%', padding: '8px' }}
               required
             />
           </div>
           {error && <p style={{ color: 'red' }}>{error}</p>}
           <button type="submit" style={{ padding: '10px 20px' }}>Login</button>
         </form>
         <p style={{ marginTop: '20px' }}>
           Don't have an account? <a href="/register">Register</a>
         </p>
       </div>
     );
   }
   
   export default Login;
   ```

2. Create simple Dashboard placeholder:
   `frontend/password-manager-ui/src/pages/Dashboard.js`:
   ```javascript
   import React from 'react';
   import { getCurrentUser, signOut } from '../utils/auth';
   
   function Dashboard() {
     const user = getCurrentUser();
     
     if (!user) {
       window.location.href = '/login';
       return null;
     }
   
     return (
       <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
         <h2>Dashboard</h2>
         <p>Welcome! You are logged in.</p>
         <button onClick={() => {
           signOut();
           window.location.href = '/login';
         }}>
           Logout
         </button>
       </div>
     );
   }
   
   export default Dashboard;
   ```

**Deliverable:** Login page and basic dashboard working

---

### Friday, Feb 21 (1 hour) - Add Routing

**Tasks:**
1. Update `frontend/password-manager-ui/src/App.js`:
   ```javascript
   import React from 'react';
   import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
   import Login from './pages/Login';
   import Register from './pages/Register';
   import Dashboard from './pages/Dashboard';
   
   function App() {
     return (
       <Router>
         <Routes>
           <Route path="/" element={<Navigate to="/login" />} />
           <Route path="/login" element={<Login />} />
           <Route path="/register" element={<Register />} />
           <Route path="/dashboard" element={<Dashboard />} />
         </Routes>
       </Router>
     );
   }
   
   export default App;
   ```

2. **Test locally:**
   ```bash
   npm start
   # Test flow: Register → Verify email → Login → Dashboard → Logout
   ```

**Deliverable:** Full authentication flow working locally

---

### Saturday, Feb 22 (2 hours) - Deploy to S3 + CloudFront Part 1

**Tasks:**
1. **Build React app:**
   ```bash
   cd frontend/password-manager-ui
   npm run build
   # Creates optimized production build in build/ folder
   ```

2. **Update CloudFormation template** (`infrastructure/main-template.yaml`):
   ```yaml
   AWSTemplateFormatVersion: '2010-09-09'
   Description: 'Family Password Manager - Main Stack'
   
   Parameters:
     DomainName:
       Type: String
       Description: 'Your registered domain name'
   
   Resources:
     # S3 Bucket for hosting
     WebsiteBucket:
       Type: AWS::S3::Bucket
       Properties:
         BucketName: !Sub 'password-manager-${AWS::AccountId}'
         WebsiteConfiguration:
           IndexDocument: index.html
           ErrorDocument: index.html
         PublicAccessBlockConfiguration:
           BlockPublicAcls: false
           BlockPublicPolicy: false
           IgnorePublicAcls: false
           RestrictPublicBuckets: false
   
     WebsiteBucketPolicy:
       Type: AWS::S3::BucketPolicy
       Properties:
         Bucket: !Ref WebsiteBucket
         PolicyDocument:
           Statement:
             - Effect: Allow
               Principal: '*'
               Action: 's3:GetObject'
               Resource: !Sub '${WebsiteBucket.Arn}/*'
   
   Outputs:
     BucketName:
       Value: !Ref WebsiteBucket
       Description: 'S3 bucket name for website'
     
     WebsiteURL:
       Value: !GetAtt WebsiteBucket.WebsiteURL
       Description: 'S3 website URL'
   ```

3. **Deploy stack:**
   ```bash
   cd infrastructure
   aws cloudformation create-stack \
     --stack-name password-manager-prod \
     --template-body file://main-template.yaml \
     --parameters ParameterKey=DomainName,ParameterValue=yourdomain.com
   
   # Wait for completion (5-10 minutes)
   aws cloudformation wait stack-create-complete --stack-name password-manager-prod
   ```

4. **Upload built React app to S3:**
   ```bash
   # Get bucket name from CloudFormation outputs
   BUCKET_NAME=$(aws cloudformation describe-stacks \
     --stack-name password-manager-prod \
     --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' \
     --output text)
   
   # Upload files
   cd ../frontend/password-manager-ui
   aws s3 sync build/ s3://$BUCKET_NAME/
   ```

5. **Test:** Visit the S3 website URL from CloudFormation outputs

**Deliverable:** React app deployed and accessible via S3 URL (not custom domain yet)

---

### Sunday, Feb 23 (1 hour) - Request SSL Certificate

**Tasks:**
1. **Request certificate in ACM** (must be in us-east-1 for CloudFront):
   ```bash
   aws acm request-certificate \
     --domain-name yourdomain.com \
     --validation-method DNS \
     --region us-east-1
   ```

2. **Get validation CNAME records:**
   ```bash
   aws acm describe-certificate \
     --certificate-arn arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT_ID \
     --region us-east-1
   ```

3. **Add CNAME records to Route 53:**
   - AWS Console → Route 53 → Your hosted zone
   - Create record → CNAME
   - Copy Name and Value from ACM
   - Wait 5-30 minutes for validation

4. **Check certificate status:**
   ```bash
   aws acm describe-certificate \
     --certificate-arn arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT_ID \
     --region us-east-1 \
     --query 'Certificate.Status'
   # Should show "ISSUED" when ready
   ```

**Deliverable:** SSL certificate issued and validated

**Note:** Certificate validation can take up to 30 minutes. Start this early in the day.

---

### Monday, Feb 24 (1 hour) - Create CloudFront Distribution

**Tasks:**
1. **Add to CloudFormation template** (in `main-template.yaml`):
   ```yaml
   Parameters:
     CertificateArn:
       Type: String
       Description: 'ACM certificate ARN from us-east-1'
   
   Resources:
     CloudFrontDistribution:
       Type: AWS::CloudFront::Distribution
       Properties:
         DistributionConfig:
           Enabled: true
           DefaultRootObject: index.html
           Origins:
             - Id: S3Origin
               DomainName: !GetAtt WebsiteBucket.RegionalDomainName
               S3OriginConfig:
                 OriginAccessIdentity: ''
           DefaultCacheBehavior:
             TargetOriginId: S3Origin
             ViewerProtocolPolicy: redirect-to-https
             AllowedMethods:
               - GET
               - HEAD
               - OPTIONS
             CachedMethods:
               - GET
               - HEAD
             ForwardedValues:
               QueryString: false
               Cookies:
                 Forward: none
             MinTTL: 0
             DefaultTTL: 86400
             MaxTTL: 31536000
           Aliases:
             - !Ref DomainName
           ViewerCertificate:
             AcmCertificateArn: !Ref CertificateArn
             SslSupportMethod: sni-only
             MinimumProtocolVersion: TLSv1.2_2021
           CustomErrorResponses:
             - ErrorCode: 404
               ResponseCode: 200
               ResponsePagePath: /index.html
   
   Outputs:
     CloudFrontDomainName:
       Value: !GetAtt CloudFrontDistribution.DomainName
       Description: 'CloudFront distribution domain name'
   ```

2. **Update stack:**
   ```bash
   aws cloudformation update-stack \
     --stack-name password-manager-prod \
     --template-body file://main-template.yaml \
     --parameters \
       ParameterKey=DomainName,ParameterValue=yourdomain.com \
       ParameterKey=CertificateArn,ParameterValue=arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT_ID
   
   # Wait for completion (15-20 minutes - CloudFront is slow)
   ```

**Deliverable:** CloudFront distribution created

---

### Tuesday, Feb 25 (1 hour) - Configure Route 53 DNS

**Tasks:**
1. **Get CloudFront domain name:**
   ```bash
   CF_DOMAIN=$(aws cloudformation describe-stacks \
     --stack-name password-manager-prod \
     --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDomainName`].OutputValue' \
     --output text)
   ```

2. **Create Route 53 A record:**
   - AWS Console → Route 53 → Your hosted zone
   - Create record
   - Record name: (leave blank for root domain) or `www`
   - Record type: A
   - Alias: Yes
   - Route traffic to: CloudFront distribution
   - Choose your distribution from dropdown
   - Create

3. **Wait for DNS propagation** (15-60 minutes)

4. **Test:**
   ```bash
   nslookup yourdomain.com
   # Should point to CloudFront
   ```

5. **Visit https://yourdomain.com** - should see your login page!

**Deliverable:** Custom domain working with HTTPS

---

### Wednesday, Feb 26 (1 hour) - End-to-End Testing

**Tasks:**
1. **Test complete flow at real domain:**
   - Visit https://yourdomain.com
   - Register new account with your email
   - Check email for verification code
   - Verify account
   - Log in
   - See dashboard
   - Log out
   - Log back in

2. **Test from different devices:**
   - Desktop browser
   - Phone browser
   - Incognito mode

3. **Document any issues** in GitHub Issues

**Deliverable:** Confirmed working authentication on production domain

---

### Thursday, Feb 27 (1 hour) - Sprint 1 Documentation

**Tasks:**
1. **Update README.md:**
   - Add "Current Status: Authentication complete" section
   - Add screenshot of login page
   - Document deployment process

2. **Create `docs/DEPLOYMENT.md`:**
   - Document how to deploy
   - Include all CloudFormation commands
   - Include troubleshooting tips

3. **Git commit:**
   ```bash
   git add .
   git commit -m "Sprint 1 complete: Authentication and deployment"
   git push
   ```

**Deliverable:** Documentation updated

---

### Friday, Feb 28 - Sunday, Mar 2 (Buffer/Catch-up)

**Use this time to:**
- Fix any issues from testing
- Improve UI styling if desired
- Get ahead on Sprint 2 reading
- OR take a break - you earned it!

---

## Sprint 2: Encryption Foundation (Week 4: Mar 3-9)
**Goal**: Implement client-side encryption/decryption  
**Total Time**: 9 hours

### Monday, Mar 3 (1 hour) - Study PBKDF2 Key Derivation

**Tasks:**
1. **Read documentation:**
   - MDN: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey
   - Focus on PBKDF2 parameters: salt, iterations, hash function

2. **Understand why we need key derivation:**
   - Master password is too short/weak to use directly as encryption key
   - PBKDF2 stretches it into strong 256-bit key
   - Iterations make brute-force attacks expensive (100K iterations = 100K hash computations per guess)

3. **Research best practices:**
   - OWASP recommendations for PBKDF2
   - Iteration count (100K minimum, we'll use 100K)
   - Salt requirements (random, unique per user)

**Deliverable:** Clear understanding of key derivation concepts

---

### Tuesday, Mar 4 (1 hour) - Study AES-GCM Encryption

**Tasks:**
1. **Read documentation:**
   - MDN: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt
   - Focus on AES-GCM mode

2. **Understand GCM mode:**
   - GCM = Galois/Counter Mode
   - Provides both encryption AND authentication (integrity checking)
   - IV (Initialization Vector) must be unique for each encryption
   - Tag is automatically included (prevents tampering)

3. **Watch tutorial video:**
   - Search YouTube: "AES GCM encryption explained"
   - 15-20 minute video explaining the concepts

**Deliverable:** Understanding of AES-GCM encryption mode

---

### Wednesday, Mar 5 (2 hours) - Build Crypto Utility Module

**Tasks:**
1. Create `frontend/password-manager-ui/src/utils/crypto.js`:

```javascript
const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16; // bytes
const IV_LENGTH = 12; // bytes for GCM

/**
 * Generate random salt for a new user
 */
export function generateSalt() {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return arrayBufferToBase64(salt);
}

/**
 * Derive encryption key from master password using PBKDF2
 */
export async function deriveKey(masterPassword, saltBase64) {
  const encoder = new TextEncoder();
  const salt = base64ToArrayBuffer(saltBase64);
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(masterPassword),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  // Derive AES key
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false, // not extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data with AES-GCM
 */
export async function encrypt(plaintext, key) {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encoder.encode(plaintext)
  );
  
  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv)
  };
}

/**
 * Decrypt data with AES-GCM
 */
export async function decrypt(ciphertextBase64, ivBase64, key) {
  const decoder = new TextDecoder();
  const ciphertext = base64ToArrayBuffer(ciphertextBase64);
  const iv = base64ToArrayBuffer(ivBase64);
  
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    ciphertext
  );
  
  return decoder.decode(plaintext);
}

/**
 * Encrypt a password entry object
 */
export async function encryptPasswordEntry(entry, key) {
  const plaintext = JSON.stringify(entry);
  return await encrypt(plaintext, key);
}

/**
 * Decrypt a password entry object
 */
export async function decryptPasswordEntry(ciphertext, iv, key) {
  const plaintext = await decrypt(ciphertext, iv, key);
  return JSON.parse(plaintext);
}

// Utility functions for base64 encoding/decoding
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
```

**Deliverable:** Complete crypto utility module

---

### Thursday, Mar 6 (2 hours) - Write Unit Tests

**Tasks:**
1. Create `frontend/password-manager-ui/src/utils/crypto.test.js`:

```javascript
import { 
  generateSalt, 
  deriveKey, 
  encrypt, 
  decrypt,
  encryptPasswordEntry,
  decryptPasswordEntry
} from './crypto';

describe('Crypto Utilities', () => {
  
  test('generateSalt produces unique values', () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    expect(salt1).not.toBe(salt2);
    expect(salt1.length).toBeGreaterThan(0);
  });
  
  test('deriveKey produces consistent key from same password+salt', async () => {
    const password = 'TestPassword123!';
    const salt = generateSalt();
    
    const key1 = await deriveKey(password, salt);
    const key2 = await deriveKey(password, salt);
    
    // Can't directly compare keys, but encryption with same key should produce decryptable results
    const testData = 'Hello World';
    const { ciphertext, iv } = await encrypt(testData, key1);
    const decrypted = await decrypt(ciphertext, iv, key2);
    
    expect(decrypted).toBe(testData);
  });
  
  test('encrypt then decrypt returns original text', async () => {
    const password = 'TestPassword123!';
    const salt = generateSalt();
    const key = await deriveKey(password, salt);
    
    const original = 'This is my password: SuperSecret123!';
    const { ciphertext, iv } = await encrypt(original, key);
    const decrypted = await decrypt(ciphertext, iv, key);
    
    expect(decrypted).toBe(original);
  });
  
  test('wrong password fails to decrypt', async () => {
    const correctPassword = 'CorrectPassword123!';
    const wrongPassword = 'WrongPassword123!';
    const salt = generateSalt();
    
    const correctKey = await deriveKey(correctPassword, salt);
    const wrongKey = await deriveKey(wrongPassword, salt);
    
    const original = 'Secret data';
    const { ciphertext, iv } = await encrypt(original, correctKey);
    
    await expect(decrypt(ciphertext, iv, wrongKey)).rejects.toThrow();
  });
  
  test('encryptPasswordEntry handles objects correctly', async () => {
    const password = 'TestPassword123!';
    const salt = generateSalt();
    const key = await deriveKey(password, salt);
    
    const entry = {
      website: 'netflix.com',
      username: 'user@email.com',
      password: 'Netflix123!',
      notes: 'Family account'
    };
    
    const { ciphertext, iv } = await encryptPasswordEntry(entry, key);
    const decrypted = await decryptPasswordEntry(ciphertext, iv, key);
    
    expect(decrypted).toEqual(entry);
  });
  
  test('different IVs produce different ciphertexts', async () => {
    const password = 'TestPassword123!';
    const salt = generateSalt();
    const key = await deriveKey(password, salt);
    const plaintext = 'Same data';
    
    const result1 = await encrypt(plaintext, key);
    const result2 = await encrypt(plaintext, key);
    
    // Same plaintext + same key should produce different ciphertexts (due to random IV)
    expect(result1.ciphertext).not.toBe(result2.ciphertext);
    expect(result1.iv).not.toBe(result2.iv);
    
    // But both should decrypt to original
    expect(await decrypt(result1.ciphertext, result1.iv, key)).toBe(plaintext);
    expect(await decrypt(result2.ciphertext, result2.iv, key)).toBe(plaintext);
  });
  
});
```

2. **Run tests:**
   ```bash
   npm test
   ```

3. **Fix any failing tests** until all pass

**Deliverable:** All crypto tests passing

---

### Friday, Mar 7 (2 hours) - Master Password Setup Flow

**Tasks:**
1. Create `frontend/password-manager-ui/src/pages/MasterPasswordSetup.js`:

```javascript
import React, { useState } from 'react';
import { generateSalt, deriveKey } from '../utils/crypto';

function MasterPasswordSetup() {
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSetup = async (e) => {
    e.preventDefault();
    setError('');
    
    if (masterPassword.length < 12) {
      setError('Master password must be at least 12 characters');
      return;
    }
    
    if (masterPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      // Generate salt for this user
      const salt = generateSalt();
      
      // Derive key (to verify it works)
      const key = await deriveKey(masterPassword, salt);
      
      // Store salt in user's metadata (we'll add this API call in Sprint 4)
      // For now, just store in sessionStorage
      sessionStorage.setItem('userSalt', salt);
      sessionStorage.setItem('encryptionKey', 'derived'); // placeholder
      
      console.log('Master password set up successfully');
      alert('Master password set! Salt: ' + salt.substring(0, 10) + '...');
      
      // TODO: Send salt to backend to store in DynamoDB
      
    } catch (err) {
      setError('Failed to set up encryption: ' + err.message);
    }
  };
  
  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
      <h2>Set Up Master Password</h2>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Your master password encrypts all your data. 
        <strong> If you lose it, your data cannot be recovered.</strong>
      </p>
      <form onSubmit={handleSetup}>
        <div style={{ marginBottom: '15px' }}>
          <label>Master Password:</label>
          <input
            type="password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            placeholder="At least 12 characters"
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Confirm Master Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: '10px 20px' }}>
          Set Master Password
        </button>
      </form>
      
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#FFF3CD', border: '1px solid #FFC107' }}>
        <strong>⚠️ Important:</strong>
        <ul style={{ marginTop: '10px', fontSize: '14px' }}>
          <li>Write down your master password in a safe place</li>
          <li>We cannot recover it if you forget</li>
          <li>This is different from your login password</li>
        </ul>
      </div>
    </div>
  );
}

export default MasterPasswordSetup;
```

2. **Add route to App.js:**
   ```javascript
   <Route path="/setup-master-password" element={<MasterPasswordSetup />} />
   ```

3. **Test the flow:**
   - Visit /setup-master-password
   - Try weak password (should reject)
   - Try mismatched passwords (should reject)
   - Set valid master password
   - Check browser console for salt

**Deliverable:** Master password setup page working

---

### Saturday, Mar 8 (1 hour) - Integration Testing

**Tasks:**
1. **Test encryption end-to-end:**
   - Set up master password
   - Manually encrypt a test object in console:
   ```javascript
   import { deriveKey, encryptPasswordEntry } from './utils/crypto';
   
   const salt = sessionStorage.getItem('userSalt');
   const key = await deriveKey('YourMasterPassword123!', salt);
   const entry = { website: 'test.com', password: 'secret' };
   const encrypted = await encryptPasswordEntry(entry, key);
   console.log('Encrypted:', encrypted);
   ```

2. **Test decryption:**
   ```javascript
   const decrypted = await decryptPasswordEntry(encrypted.ciphertext, encrypted.iv, key);
   console.log('Decrypted:', decrypted);
   ```

3. **Document test results** in GitHub

**Deliverable:** Verified encryption working correctly

---

### Sunday, Mar 9 (30 min) - Sprint 2 Check-in

**Checklist:**
- [ ] Crypto utility module created
- [ ] All unit tests passing
- [ ] Master password setup page working
- [ ] Can encrypt/decrypt test data
- [ ] Salt generation working
- [ ] Key derivation working

**Motivation Check (1-10):** ____

**Next Week Preview:** Sprint 3 = Database (Create DynamoDB table, build Lambda function, test storage)

---

## Sprint 3: Database Setup (Week 5: Mar 10-16)
**Goal**: DynamoDB table created, Lambda can read/write  
**Total Time**: 9 hours

### Monday, Mar 10 (1 hour) - Design DynamoDB Schema

**Tasks:**
1. **Create schema document** `docs/DYNAMODB_SCHEMA.md`:

```markdown
# DynamoDB Schema Design

## Table: PasswordVault

### Keys
- **Partition Key (PK)**: `userId` (String) - Cognito sub ID
- **Sort Key (SK)**: `itemType#itemId` (String) - Composite key

### Item Types

#### User Metadata (stores salt)
```
{
  userId: "cognito-sub-123",
  itemType#itemId: "METADATA#salt",
  salt: "base64-encoded-salt",
  createdAt: "2025-03-10T12:00:00Z"
}
```

#### Password Entry
```
{
  userId: "cognito-sub-123",
  itemType#itemId: "ENTRY#uuid-abc-123",
  encryptedData: "base64-encrypted-blob",
  iv: "base64-iv",
  createdAt: "2025-03-10T12:00:00Z",
  updatedAt: "2025-03-10T12:30:00Z"
}
```

### Access Patterns
1. Get user's salt: `PK=userId, SK=METADATA#salt`
2. List all passwords: `PK=userId, SK begins_with ENTRY#`
3. Get single password: `PK=userId, SK=ENTRY#<uuid>`
4. Delete password: Delete item with PK=userId, SK=ENTRY#<uuid>`

### Billing
- On-Demand mode (pay per request)
- Estimated: ~$0.40/month for family use
```

**Deliverable:** Schema documented

---

### Tuesday, Mar 11 (2 hours) - Create DynamoDB Table in CloudFormation

**Tasks:**
1. **Add to `infrastructure/main-template.yaml`:**

```yaml
Resources:
  PasswordVaultTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: PasswordVault
      BillingMode: PAY_PER_REQUEST  # On-demand pricing
      AttributeDefinitions:
        - AttributeName: userId
          AttributeType: S
        - AttributeName: itemTypeId
          AttributeType: S
      KeySchema:
        - AttributeName: userId
          KeyType: HASH   # Partition key
        - AttributeName: itemTypeId
          KeyType: RANGE  # Sort key
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true
      SSESpecification:
        SSEEnabled: true  # Encryption at rest
      Tags:
        - Key: Project
          Value: PasswordManager

Outputs:
  TableName:
    Value: !Ref PasswordVaultTable
    Description: 'DynamoDB table name'
```

2. **Update CloudFormation stack:**
   ```bash
   cd infrastructure
   aws cloudformation update-stack \
     --stack-name password-manager-prod \
     --template-body file://main-template.yaml \
     --parameters \
       ParameterKey=DomainName,UsePreviousValue=true \
       ParameterKey=CertificateArn,UsePreviousValue=true
   
   # Wait for update
   aws cloudformation wait stack-update-complete --stack-name password-manager-prod
   ```

3. **Verify table created:**
   - AWS Console → DynamoDB → Tables
   - Should see "PasswordVault" table
   - Check: On-demand billing, Point-in-time recovery enabled

**Deliverable:** DynamoDB table created

---

### Wednesday, Mar 12 (2 hours) - Create Lambda Function

**Tasks:**
1. **Create Lambda code directory:**
   ```bash
   mkdir -p backend/passwordCRUD
   cd backend/passwordCRUD
   npm init -y
   npm install uuid
   ```

2. **Create `backend/passwordCRUD/index.js`:**

```javascript
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || 'PasswordVault';

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  // Extract userId from Cognito authorizer
  const userId = event.requestContext?.authorizer?.claims?.sub;
  
  if (!userId) {
    return {
      statusCode: 401,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }
  
  const httpMethod = event.httpMethod;
  const path = event.path;
  
  try {
    let response;
    
    if (httpMethod === 'OPTIONS') {
      // Handle preflight CORS
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: ''
      };
    }
    
    if (httpMethod === 'GET' && path === '/passwords') {
      response = await listPasswords(userId);
    } else if (httpMethod === 'GET' && path.startsWith('/passwords/')) {
      const entryId = path.split('/')[2];
      response = await getPassword(userId, entryId);
    } else if (httpMethod === 'POST' && path === '/passwords') {
      const body = JSON.parse(event.body);
      response = await createPassword(userId, body);
    } else if (httpMethod === 'PUT' && path.startsWith('/passwords/')) {
      const entryId = path.split('/')[2];
      const body = JSON.parse(event.body);
      response = await updatePassword(userId, entryId, body);
    } else if (httpMethod === 'DELETE' && path.startsWith('/passwords/')) {
      const entryId = path.split('/')[2];
      response = await deletePassword(userId, entryId);
    } else if (httpMethod === 'GET' && path === '/user/salt') {
      response = await getUserSalt(userId);
    } else if (httpMethod === 'POST' && path === '/user/salt') {
      const body = JSON.parse(event.body);
      response = await setUserSalt(userId, body.salt);
    } else {
      response = {
        statusCode: 404,
        body: { error: 'Not found' }
      };
    }
    
    return {
      statusCode: response.statusCode || 200,
      headers: corsHeaders(),
      body: JSON.stringify(response.body)
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function listPasswords(userId) {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'userId = :userId AND begins_with(itemTypeId, :prefix)',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':prefix': 'ENTRY#'
    }
  };
  
  const result = await ddb.send(new QueryCommand(params));
  
  return {
    statusCode: 200,
    body: { passwords: result.Items || [] }
  };
}

async function getPassword(userId, entryId) {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      userId: userId,
      itemTypeId: `ENTRY#${entryId}`
    }
  };
  
  const result = await ddb.send(new GetCommand(params));
  
  if (!result.Item) {
    return {
      statusCode: 404,
      body: { error: 'Password not found' }
    };
  }
  
  return {
    statusCode: 200,
    body: { password: result.Item }
  };
}

async function createPassword(userId, data) {
  const entryId = uuidv4();
  const now = new Date().toISOString();
  
  const item = {
    userId: userId,
    itemTypeId: `ENTRY#${entryId}`,
    encryptedData: data.encryptedData,
    iv: data.iv,
    createdAt: now,
    updatedAt: now
  };
  
  const params = {
    TableName: TABLE_NAME,
    Item: item
  };
  
  await ddb.send(new PutCommand(params));
  
  return {
    statusCode: 201,
    body: { 
      message: 'Password created',
      entryId: entryId,
      item: item
    }
  };
}

async function updatePassword(userId, entryId, data) {
  const now = new Date().toISOString();
  
  const item = {
    userId: userId,
    itemTypeId: `ENTRY#${entryId}`,
    encryptedData: data.encryptedData,
    iv: data.iv,
    updatedAt: now
  };
  
  const params = {
    TableName: TABLE_NAME,
    Item: item,
    ConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  };
  
  await ddb.send(new PutCommand(params));
  
  return {
    statusCode: 200,
    body: { 
      message: 'Password updated',
      item: item
    }
  };
}

async function deletePassword(userId, entryId) {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      userId: userId,
      itemTypeId: `ENTRY#${entryId}`
    },
    ConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  };
  
  await ddb.send(new DeleteCommand(params));
  
  return {
    statusCode: 200,
    body: { message: 'Password deleted' }
  };
}

async function getUserSalt(userId) {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      userId: userId,
      itemTypeId: 'METADATA#salt'
    }
  };
  
  const result = await ddb.send(new GetCommand(params));
  
  if (!result.Item) {
    return {
      statusCode: 404,
      body: { error: 'Salt not found' }
    };
  }
  
  return {
    statusCode: 200,
    body: { salt: result.Item.salt }
  };
}

async function setUserSalt(userId, salt) {
  const now = new Date().toISOString();
  
  const item = {
    userId: userId,
    itemTypeId: 'METADATA#salt',
    salt: salt,
    createdAt: now
  };
  
  const params = {
    TableName: TABLE_NAME,
    Item: item,
    ConditionExpression: 'attribute_not_exists(userId)',
  };
  
  try {
    await ddb.send(new PutCommand(params));
    return {
      statusCode: 201,
      body: { message: 'Salt created' }
    };
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 409,
        body: { error: 'Salt already exists' }
      };
    }
    throw error;
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // TODO: restrict to your domain
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Max-Age': '86400'
  };
}
```

3. **Create deployment package:**
   ```bash
   zip -r function.zip index.js node_modules package.json
   ```

**Deliverable:** Lambda function code written

---

### Thursday, Mar 13 (2 hours) - Add Lambda to CloudFormation

**Tasks:**
1. **Add IAM role for Lambda** in `main-template.yaml`:

```yaml
Resources:
  LambdaExecutionRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
      Policies:
        - PolicyName: DynamoDBAccess
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  - dynamodb:PutItem
                  - dynamodb:GetItem
                  - dynamodb:Query
                  - dynamodb:DeleteItem
                Resource: !GetAtt PasswordVaultTable.Arn

  PasswordCRUDFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: PasswordCRUD
      Runtime: nodejs18.x
      Handler: index.handler
      Role: !GetAtt LambdaExecutionRole.Arn
      Code:
        ZipFile: |
          exports.handler = async (event) => {
            return { statusCode: 200, body: 'Placeholder' };
          };
      Environment:
        Variables:
          TABLE_NAME: !Ref PasswordVaultTable
      Timeout: 30

Outputs:
  LambdaFunctionArn:
    Value: !GetAtt PasswordCRUDFunction.Arn
    Description: 'Lambda function ARN'
```

2. **Deploy:**
   ```bash
   aws cloudformation update-stack \
     --stack-name password-manager-prod \
     --template-body file://main-template.yaml \
     --capabilities CAPABILITY_IAM \
     --parameters \
       ParameterKey=DomainName,UsePreviousValue=true \
       ParameterKey=CertificateArn,UsePreviousValue=true
   ```

3. **Upload actual Lambda code:**
   ```bash
   cd ../backend/passwordCRUD
   aws lambda update-function-code \
     --function-name PasswordCRUD \
     --zip-file fileb://function.zip
   ```

**Deliverable:** Lambda function deployed

---

### Friday, Mar 14 (1 hour) - Test Lambda Locally

**Tasks:**
1. **Install SAM CLI** (if not already):
   ```bash
   # Mac
   brew install aws-sam-cli
   
   # Windows
   # Download from AWS
   ```

2. **Create test event** `backend/passwordCRUD/test-event.json`:

```json
{
  "httpMethod": "POST",
  "path": "/user/salt",
  "body": "{\"salt\":\"testSaltBase64String\"}",
  "requestContext": {
    "authorizer": {
      "claims": {
        "sub": "test-user-123"
      }
    }
  }
}
```

3. **Invoke Lambda locally:**
   ```bash
   sam local invoke PasswordCRUDFunction --event test-event.json
   ```

4. **Check DynamoDB** for created item:
   - AWS Console → DynamoDB → PasswordVault table → Items
   - Should see item with userId=test-user-123

**Deliverable:** Lambda tested and working

---

### Saturday, Mar 15 (1 hour) - End-to-End Manual Testing

**Tasks:**
1. **Test CREATE:**
   - Use AWS Console Lambda test feature
   - Create test event with POST /passwords
   - Verify item in DynamoDB

2. **Test LIST:**
   - Test GET /passwords
   - Should return array of passwords

3. **Test GET single:**
   - Test GET /passwords/{entryId}
   - Should return specific item

4. **Test DELETE:**
   - Test DELETE /passwords/{entryId}
   - Verify item removed from DynamoDB

5. **Test GET salt:**
   - Test GET /user/salt
   - Should return salt

**Deliverable:** All CRUD operations working

---

### Sunday, Mar 16 (30 min) - Sprint 3 Check-in

**Checklist:**
- [ ] DynamoDB table created
- [ ] Lambda function deployed
- [ ] All CRUD operations working
- [ ] Can store and retrieve salt
- [ ] IAM permissions correct

**Motivation Check (1-10):** ____

**Next Week Preview:** Sprint 4 = Connect frontend to backend via API Gateway

---

## Sprint 4: API Gateway Integration (Week 6: Mar 17-23)
**Goal**: Frontend can call Lambda via API Gateway  
**Total Time**: 9 hours

### Monday, Mar 17 (2 hours) - Create API Gateway in CloudFormation

**Tasks:**
1. **Add to `main-template.yaml`:**

```yaml
Resources:
  PasswordAPI:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: PasswordManagerAPI
      Description: API for password management
      EndpointConfiguration:
        Types:
          - REGIONAL

  # /passwords resource
  PasswordsResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref PasswordAPI
      ParentId: !GetAtt PasswordAPI.RootResourceId
      PathPart: passwords

  # /passwords/{id} resource
  PasswordsIdResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref PasswordAPI
      ParentId: !Ref PasswordsResource
      PathPart: '{id}'

  # /user resource
  UserResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref PasswordAPI
      ParentId: !GetAtt PasswordAPI.RootResourceId
      PathPart: user

  # /user/salt resource
  UserSaltResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref PasswordAPI
      ParentId: !Ref UserResource
      PathPart: salt

  # Cognito Authorizer
  CognitoAuthorizer:
    Type: AWS::ApiGateway::Authorizer
    Properties:
      Name: CognitoAuthorizer
      Type: COGNITO_USER_POOLS
      IdentitySource: method.request.header.Authorization
      RestApiId: !Ref PasswordAPI
      ProviderARNs:
        - !Sub 'arn:aws:cognito-idp:${AWS::Region}:${AWS::AccountId}:userpool/${CognitoUserPoolId}'

  # GET /passwords
  GetPasswordsMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref PasswordAPI
      ResourceId: !Ref PasswordsResource
      HttpMethod: GET
      AuthorizationType: COGNITO_USER_POOLS
      AuthorizerId: !Ref CognitoAuthorizer
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub 'arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${PasswordCRUDFunction.Arn}/invocations'

  # POST /passwords
  PostPasswordsMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref PasswordAPI
      ResourceId: !Ref PasswordsResource
      HttpMethod: POST
      AuthorizationType: COGNITO_USER_POOLS
      AuthorizerId: !Ref CognitoAuthorizer
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub 'arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${PasswordCRUDFunction.Arn}/invocations'

  # OPTIONS /passwords (for CORS)
  OptionsPasswordsMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref PasswordAPI
      ResourceId: !Ref PasswordsResource
      HttpMethod: OPTIONS
      AuthorizationType: NONE
      Integration:
        Type: MOCK
        IntegrationResponses:
          - StatusCode: 200
            ResponseParameters:
              method.response.header.Access-Control-Allow-Headers: "'Content-Type,Authorization'"
              method.response.header.Access-Control-Allow-Methods: "'GET,POST,OPTIONS'"
              method.response.header.Access-Control-Allow-Origin: "'*'"
        RequestTemplates:
          application/json: '{"statusCode": 200}'
      MethodResponses:
        - StatusCode: 200
          ResponseParameters:
            method.response.header.Access-Control-Allow-Headers: true
            method.response.header.Access-Control-Allow-Methods: true
            method.response.header.Access-Control-Allow-Origin: true

  # Similar methods for DELETE, PUT, GET by ID...
  # (I'll provide full template separately to save space)

  # Lambda Permission for API Gateway
  LambdaAPIPermission:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !Ref PasswordCRUDFunction
      Action: lambda:InvokeFunction
      Principal: apigateway.amazonaws.com
      SourceArn: !Sub 'arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${PasswordAPI}/*'

  # Deployment
  APIDeployment:
    Type: AWS::ApiGateway::Deployment
    DependsOn:
      - GetPasswordsMethod
      - PostPasswordsMethod
    Properties:
      RestApiId: !Ref PasswordAPI
      StageName: prod

Outputs:
  APIEndpoint:
    Value: !Sub 'https://${PasswordAPI}.execute-api.${AWS::Region}.amazonaws.com/prod'
    Description: 'API Gateway endpoint'
```

2. **Deploy:**
   ```bash
   aws cloudformation update-stack \
     --stack-name password-manager-prod \
     --template-body file://main-template.yaml \
     --capabilities CAPABILITY_IAM \
     --parameters \
       ParameterKey=DomainName,UsePreviousValue=true \
       ParameterKey=CertificateArn,UsePreviousValue=true \
       ParameterKey=CognitoUserPoolId,ParameterValue=us-west-2_ABC123
   ```

3. **Get API endpoint:**
   ```bash
   aws cloudformation describe-stacks \
     --stack-name password-manager-prod \
     --query 'Stacks[0].Outputs[?OutputKey==`APIEndpoint`].OutputValue' \
     --output text
   ```

**Deliverable:** API Gateway created and deployed

**Note:** This is 2 hours because CloudFormation API Gateway resources are verbose. The template I provided above is abbreviated - you'll need all the methods.

---

### Tuesday, Mar 18 (1 hour) - Test API with Curl

**Tasks:**
1. **Get Cognito token:**
   - Log into your app
   - Open browser dev tools → Application → Local Storage
   - Find Cognito token (starts with `eyJ...`)

2. **Test GET /passwords:**
   ```bash
   curl -X GET https://your-api-id.execute-api.us-west-2.amazonaws.com/prod/passwords \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

3. **Test POST /passwords:**
   ```bash
   curl -X POST https://your-api-id.execute-api.us-west-2.amazonaws.com/prod/passwords \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -H "Content-Type: application/json" \
     -d '{"encryptedData":"test","iv":"test"}'
   ```

4. **Verify responses** - should get 200 OK

**Deliverable:** API working via curl

---

### Wednesday, Mar 19 (2 hours) - Create API Utility in React

**Tasks:**
1. **Update `config.js`:**
   ```javascript
   const config = {
     cognito: {
       region: 'us-west-2',
       userPoolId: 'us-west-2_ABC123',
       userPoolWebClientId: 'abcd1234567890',
     },
     api: {
       endpoint: 'https://your-api-id.execute-api.us-west-2.amazonaws.com/prod'
     }
   };
   ```

2. **Create `frontend/password-manager-ui/src/utils/api.js`:**

```javascript
import config from '../config';
import { getCurrentUser } from './auth';

async function getAuthToken() {
  return new Promise((resolve, reject) => {
    const cognitoUser = getCurrentUser();
    if (!cognitoUser) {
      reject(new Error('No authenticated user'));
      return;
    }
    
    cognitoUser.getSession((err, session) => {
      if (err) {
        reject(err);
      } else {
        resolve(session.getIdToken().getJwtToken());
      }
    });
  });
}

async function apiRequest(method, path, body = null) {
  const token = await getAuthToken();
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${config.api.endpoint}${path}`, options);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }
  
  return await response.json();
}

export const api = {
  // Password operations
  listPasswords: () => apiRequest('GET', '/passwords'),
  getPassword: (id) => apiRequest('GET', `/passwords/${id}`),
  createPassword: (data) => apiRequest('POST', '/passwords', data),
  updatePassword: (id, data) => apiRequest('PUT', `/passwords/${id}`, data),
  deletePassword: (id) => apiRequest('DELETE', `/passwords/${id}`),
  
  // User operations
  getUserSalt: () => apiRequest('GET', '/user/salt'),
  setUserSalt: (salt) => apiRequest('POST', '/user/salt', { salt })
};
```

**Deliverable:** API utility created

---

### Thursday, Mar 20 (2 hours) - Integrate Salt Storage

**Tasks:**
1. **Update `MasterPasswordSetup.js`:**

```javascript
import { api } from '../utils/api';

// In handleSetup function, replace sessionStorage with:
try {
  const salt = generateSalt();
  const key = await deriveKey(masterPassword, salt);
  
  // Store salt in DynamoDB
  await api.setUserSalt(salt);
  
  // Store key in sessionStorage (cleared on browser close)
  sessionStorage.setItem('encryptionKey', 'ACTIVE'); // Marker
  sessionStorage.setItem('derivedKeyTimestamp', Date.now());
  
  // In production, you'd store the actual CryptoKey object
  // For now, we'll re-derive it when needed
  
  window.location.href = '/dashboard';
} catch (err) {
  setError('Failed to save master password: ' + err.message);
}
```

2. **Create master password prompt on login:**
   `frontend/password-manager-ui/src/pages/MasterPasswordPrompt.js`:

```javascript
import React, { useState } from 'react';
import { api } from '../utils/api';
import { deriveKey } from '../utils/crypto';

function MasterPasswordPrompt({ onUnlock }) {
  const [masterPassword, setMasterPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleUnlock = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Get salt from backend
      const { salt } = await api.getUserSalt();
      
      // Derive key
      const key = await deriveKey(masterPassword, salt);
      
      // Store in session
      sessionStorage.setItem('encryptionKey', 'ACTIVE');
      sessionStorage.setItem('derivedKeyTimestamp', Date.now());
      
      // Call parent callback
      onUnlock(key, salt);
      
    } catch (err) {
      setError('Incorrect master password or network error');
    }
  };
  
  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Enter Master Password</h2>
      <p>Your passwords are encrypted. Enter your master password to decrypt them.</p>
      <form onSubmit={handleUnlock}>
        <div style={{ marginBottom: '15px' }}>
          <label>Master Password:</label>
          <input
            type="password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            autoFocus
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: '10px 20px' }}>
          Unlock
        </button>
      </form>
    </div>
  );
}

export default MasterPasswordPrompt;
```

**Deliverable:** Salt storage working end-to-end

---

### Friday, Mar 21 (1 hour) - Test Create Password Entry

**Tasks:**
1. **Create simple test in Dashboard:**

```javascript
// In Dashboard.js
import { api } from '../utils/api';
import { encryptPasswordEntry, deriveKey } from '../utils/crypto';

const testCreatePassword = async () => {
  try {
    // Get salt
    const { salt } = await api.getUserSalt();
    
    // Derive key (in real app, this is already in memory)
    const masterPassword = prompt('Enter master password:');
    const key = await deriveKey(masterPassword, salt);
    
    // Encrypt test entry
    const entry = {
      website: 'test.com',
      username: 'testuser',
      password: 'TestPassword123!'
    };
    
    const { ciphertext, iv } = await encryptPasswordEntry(entry, key);
    
    // Send to API
    const result = await api.createPassword({
      encryptedData: ciphertext,
      iv: iv
    });
    
    console.log('Created:', result);
    alert('Password created! Check DynamoDB.');
    
  } catch (err) {
    console.error('Error:', err);
    alert('Error: ' + err.message);
  }
};

// Add button to dashboard
<button onClick={testCreatePassword}>Test Create Password</button>
```

2. **Test:**
   - Click button
   - Enter master password
   - Check DynamoDB for encrypted entry

**Deliverable:** Can create encrypted password via API

---

### Saturday, Mar 22 (1 hour) - Integration Testing

**Tasks:**
1. **Test full flow:**
   - Register new user
   - Set up master password (salt stored in DynamoDB)
   - Create test password entry
   - List passwords
   - Retrieve and decrypt specific password
   - Delete password

2. **Document any bugs** in GitHub Issues

3. **Verify in DynamoDB:**
   - Salt stored correctly
   - Encrypted passwords stored
   - Data looks encrypted (unreadable)

**Deliverable:** End-to-end flow working

---

### Sunday, Mar 23 (30 min) - Sprint 4 Check-in

**Checklist:**
- [ ] API Gateway created
- [ ] All endpoints working
- [ ] Cognito authorizer configured
- [ ] CORS working
- [ ] Can create encrypted passwords
- [ ] Can retrieve encrypted passwords
- [ ] Salt storage working

**Motivation Check (1-10):** ____

**Next Week Preview:** Sprint 5-6 = Build actual UI (password list, create form, edit, delete)

---

## Sprint 5: Core UI - Create/List Passwords (Week 7-8: Mar 24-Apr 6)
**Goal**: Family can add and view passwords  
**Total Time**: 14 hours

I'll continue with the remaining sprints in the next response to keep this organized. Would you like me to continue with Sprints 5-9, or would you prefer to save this file and I'll create a separate document for the remaining weeks?

Let me know and I'll complete the full task list!