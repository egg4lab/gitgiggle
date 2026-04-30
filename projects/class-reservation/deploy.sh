#!/bin/bash

# Class Reservation System - Quick Deploy Script
# 課程預約系統 - 快速部署腳本

set -e

echo "🚀 Starting deployment process..."
echo "🚀 開始部署流程..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    print_error "AWS CLI 未安裝，請先安裝。"
    echo "Visit: https://aws.amazon.com/cli/"
    exit 1
fi

print_success "AWS CLI found"

# Check AWS credentials
print_step "Checking AWS credentials..."
if aws sts get-caller-identity &> /dev/null; then
    print_success "AWS credentials configured"
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    AWS_REGION=$(aws configure get region || echo "ap-northeast-1")
    echo "Account: $AWS_ACCOUNT"
    echo "Region: $AWS_REGION"
else
    print_error "AWS credentials not configured"
    echo "Please run: aws configure"
    exit 1
fi

# Ask for confirmation
echo ""
echo "This script will:"
echo "1. Bootstrap AWS CDK"
echo "2. Deploy infrastructure (DynamoDB, Lambda, API Gateway, S3)"
echo "3. Build and deploy frontend"
echo "4. Configure email notifications"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Step 1: Bootstrap CDK
print_step "Step 1/5: Bootstrapping AWS CDK..."
cd infrastructure
if [ ! -d "node_modules" ]; then
    npm install
fi
npx cdk bootstrap aws://$AWS_ACCOUNT/$AWS_REGION
print_success "CDK bootstrapped"

# Step 2: Deploy Infrastructure
print_step "Step 2/5: Deploying infrastructure..."
npm run deploy -- --require-approval never
print_success "Infrastructure deployed"

# Get stack outputs
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name ClassReservationStack \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
    --output text)

FRONTEND_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name ClassReservationStack \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucket`].OutputValue' \
    --output text)

CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
    --stack-name ClassReservationStack \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistribution`].OutputValue' \
    --output text)

echo "API Endpoint: $API_ENDPOINT"
echo "Frontend Bucket: $FRONTEND_BUCKET"
echo "CloudFront URL: $CLOUDFRONT_URL"

# Step 3: Configure Frontend Environment
print_step "Step 3/5: Configuring frontend..."
cd ../frontend
cat > .env << EOF
REACT_APP_API_ENDPOINT=$API_ENDPOINT
REACT_APP_REGION=$AWS_REGION
EOF
print_success "Frontend configured"

# Step 4: Build and Deploy Frontend
print_step "Step 4/5: Building and deploying frontend..."
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run build
aws s3 sync dist/ s3://$FRONTEND_BUCKET/ --delete
print_success "Frontend deployed"

# Step 5: Setup Email (Optional)
print_step "Step 5/5: Email setup..."
echo ""
read -p "Enter your coach email address (press Enter to skip): " COACH_EMAIL
if [ ! -z "$COACH_EMAIL" ]; then
    print_step "Verifying email: $COACH_EMAIL"
    aws ses verify-email-identity --email-address $COACH_EMAIL --region $AWS_REGION || true
    print_success "Verification email sent to $COACH_EMAIL"
    echo "Please check your email and click the verification link."
fi

# Print summary
echo ""
echo "=========================================="
echo "🎉 Deployment Complete! 部署完成！"
echo "=========================================="
echo ""
echo "📋 Application URLs:"
echo "   Frontend: https://$CLOUDFRONT_URL"
echo "   API: $API_ENDPOINT"
echo ""
echo "📝 Next Steps:"
echo "   1. Verify your email in the SES console"
echo "   2. Create your first student account:"
echo ""
echo "   curl -X POST \"$API_ENDPOINT/admin/students\" \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -H \"Authorization: Bearer YOUR_COACH_SECRET\" \\"
echo "     -d '{\"name\": \"Test Student\", \"email\": \"test@example.com\", \"passcode\": \"test123\"}'"
echo ""
echo "   3. Visit https://$CLOUDFRONT_URL and login!"
echo ""
echo "=========================================="
echo ""

# Save URLs to file
cd ..
cat > deployment-info.txt << EOF
Deployment Information
=====================

Date: $(date)
AWS Account: $AWS_ACCOUNT
AWS Region: $AWS_REGION

Application URLs:
- Frontend: https://$CLOUDFRONT_URL
- API Endpoint: $API_ENDPOINT
- S3 Bucket: $FRONTEND_BUCKET

Coach Email: $COACH_EMAIL

To create a student:
curl -X POST "$API_ENDPOINT/admin/students" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_COACH_SECRET" \\
  -d '{"name": "Student Name", "email": "student@example.com", "passcode": "password"}'
EOF

print_success "Deployment info saved to deployment-info.txt"
