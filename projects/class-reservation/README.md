# Class Reservation System

A smart scheduling web application for managing coaching sessions across multiple locations.

## 🎯 Features

- **Smart Availability**: 1-on-1 sessions (100 mins) automatically restricted by coach's schedule
- **Location-Based Scheduling**: Three locations (Taipei: Mon-Tue, Yi-Lan: Wed-Thu, Hsin-Chu: Fri-Sun)
- **Student Privacy**: Students see availability but not other students' bookings
- **Passcode Authentication**: Coach-managed access control
- **Visual Calendar**: Color-coded weekly/monthly views
- **Email Notifications**: 2-hour advance cancellation notices
- **Full Calendar View**: All 1-on-1 sessions displayed for reference

## 🏗️ Architecture

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Big Calendar for scheduling UI
- AWS Amplify for hosting

### Backend
- AWS Lambda (Node.js) for serverless functions
- API Gateway for REST endpoints
- DynamoDB for data persistence
- AWS SES for email notifications
- AWS Cognito for enhanced authentication (optional)

### CI/CD
- GitHub Actions for automated deployment
- Infrastructure as Code with AWS CDK

## 📋 Prerequisites

- AWS Account (root or IAM user with admin privileges)
- Node.js 20+ and npm
- Git and GitHub account
- AWS CLI installed and configured

## 🚀 Quick Start

### 1. AWS Setup

#### Install AWS CLI
```bash
# MacOS
brew install awscli

# Windows
# Download from: https://aws.amazon.com/cli/

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

#### Configure AWS Credentials
```bash
aws configure
```

Enter your credentials:
- AWS Access Key ID: (from AWS Console → IAM → Users → Security Credentials)
- AWS Secret Access Key: (from same location)
- Default region: `ap-northeast-1` (Tokyo - closest to Taiwan)
- Default output format: `json`

### 2. Clone Repository

```bash
git clone https://github.com/egg4lab/gitgiggle.git
cd gitgiggle
```

### 3. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install infrastructure dependencies
cd ../infrastructure
npm install
```

### 4. Environment Configuration

Create `.env` files:

**Frontend (.env)**
```bash
REACT_APP_API_ENDPOINT=https://your-api-id.execute-api.ap-northeast-1.amazonaws.com/prod
REACT_APP_REGION=ap-northeast-1
```

**Backend (.env)**
```bash
AWS_REGION=ap-northeast-1
DYNAMODB_TABLE_PREFIX=class-reservation
SES_FROM_EMAIL=your-verified-email@example.com
SES_REGION=ap-northeast-1
```

### 5. Deploy Infrastructure

```bash
cd infrastructure
npm run deploy
```

This will create:
- DynamoDB tables (Students, Sessions, Availability, GroupClasses)
- Lambda functions (API handlers)
- API Gateway endpoints
- S3 bucket for frontend hosting
- CloudFront distribution (optional)

### 6. Verify SES Email

```bash
aws ses verify-email-identity --email-address your-coach-email@example.com
```

Check your email and click the verification link.

### 7. Deploy Frontend

```bash
cd frontend
npm run build
aws s3 sync build/ s3://your-bucket-name/
```

## 🔧 GitHub Actions Setup

### Add AWS Credentials to GitHub Secrets

1. Go to: `https://github.com/egg4lab/gitgiggle/settings/secrets/actions`
2. Add the following secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION` (ap-northeast-1)

### Push to Deploy

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

GitHub Actions will automatically deploy changes to AWS.

## 📊 Data Schema

### Students Table
```json
{
  "studentId": "uuid",
  "passcode": "hashed-string",
  "name": "string",
  "email": "string",
  "createdAt": "timestamp"
}
```

### Sessions Table (1-on-1 Bookings)
```json
{
  "sessionId": "uuid",
  "studentId": "uuid",
  "startTime": "ISO-8601-timestamp",
  "endTime": "ISO-8601-timestamp",
  "location": "Taipei|Yi-Lan|Hsin-Chu",
  "status": "scheduled|cancelled",
  "createdAt": "timestamp"
}
```

### GroupClasses Table
```json
{
  "classId": "uuid",
  "startTime": "ISO-8601-timestamp",
  "endTime": "ISO-8601-timestamp",
  "location": "Taipei|Yi-Lan|Hsin-Chu",
  "studentIds": ["uuid1", "uuid2"],
  "maxCapacity": 10
}
```

### Availability Table (Coach Blocked Times)
```json
{
  "availabilityId": "uuid",
  "startTime": "ISO-8601-timestamp",
  "endTime": "ISO-8601-timestamp",
  "reason": "string",
  "type": "blocked|available"
}
```

## 🎨 UI Features

### Color Coding
- 🟦 **Blue**: Taipei (Mon-Tue)
- 🟩 **Green**: Yi-Lan (Wed-Thu)
- 🟧 **Orange**: Hsin-Chu (Fri-Sun)

### Views
- Weekly calendar with time slots
- Monthly overview
- Personal schedule popup on login
- Available time slots highlighted

## 🔐 Security

- Passcode-based authentication (bcrypt hashing)
- API Gateway authorization
- DynamoDB encryption at rest
- HTTPS everywhere (enforced by CloudFront)

## 📧 Email Notifications

- Session booking confirmation
- Cancellation notices (2-hour minimum advance)
- Reminder emails (1 day before session)

## 🛠️ Development

### Run Frontend Locally
```bash
cd frontend
npm start
# Opens http://localhost:3000
```

### Test Backend Locally
```bash
cd backend
npm run dev
# Runs local API server on port 3001
```

### Run Tests
```bash
npm test
```

## 📱 Mobile Responsive

Fully responsive design works on:
- Desktop (1920x1080+)
- Tablet (768x1024)
- Mobile (375x667+)

## 🔄 Backup & Recovery

DynamoDB point-in-time recovery enabled:
```bash
aws dynamodb update-continuous-backups \
  --table-name class-reservation-sessions \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

## 📚 API Endpoints

```
POST   /api/auth/login                 # Student login
GET    /api/availability               # Get available slots
POST   /api/sessions                   # Book session
DELETE /api/sessions/:id               # Cancel session
GET    /api/sessions/student/:id       # Get student's sessions
GET    /api/group-classes              # Get group classes
POST   /api/admin/students             # Create student (coach only)
```

## 🐛 Troubleshooting

### Issue: AWS CLI not configured
```bash
aws sts get-caller-identity
# Should return your AWS account info
```

### Issue: Email not sending
- Verify SES email identity
- Check SES is out of sandbox mode
- Verify IAM permissions for SES

### Issue: API Gateway 403 errors
- Check API Gateway authorization settings
- Verify Lambda execution role has correct permissions

## 📝 License

MIT License - see LICENSE file

## 👥 Support

For issues, contact: [your-email@example.com]

## 🚀 Deployment Checklist

- [ ] AWS CLI configured
- [ ] GitHub repository created
- [ ] AWS credentials added to GitHub secrets
- [ ] SES email verified
- [ ] Infrastructure deployed
- [ ] Frontend deployed
- [ ] Test booking flow
- [ ] Test cancellation with email
- [ ] Mobile responsiveness verified
- [ ] Production domain configured (optional)

---

**Built with ❤️ for efficient coaching management**
