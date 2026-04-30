# AWS + GitHub 連接完整指南
# Complete Guide to Connect AWS with GitHub

## 步驟 1: 建立 AWS IAM 使用者 (Step 1: Create AWS IAM User)

### 1.1 登入 AWS Console
1. 前往 https://console.aws.amazon.com
2. 使用你的 root 帳號登入

### 1.2 建立 IAM 使用者
1. 在 AWS Console 搜尋欄輸入 "IAM"
2. 點擊左側選單 "Users" (使用者)
3. 點擊 "Add users" (新增使用者)
4. 設定使用者名稱: `github-actions-deployer`
5. 選擇 "Access key - Programmatic access" (存取金鑰 - 程式化存取)
6. 點擊 "Next: Permissions"

### 1.3 設定權限
1. 選擇 "Attach existing policies directly" (直接附加現有政策)
2. 勾選以下政策:
   - `AdministratorAccess` (用於開發環境)
   - 或針對生產環境使用以下最小權限政策:
     - `AWSLambdaFullAccess`
     - `AmazonDynamoDBFullAccess`
     - `AmazonS3FullAccess`
     - `CloudFrontFullAccess`
     - `AmazonAPIGatewayAdministrator`
     - `IAMFullAccess`
     - `AmazonSESFullAccess`

3. 點擊 "Next: Tags" (可選)
4. 點擊 "Next: Review"
5. 點擊 "Create user"

### 1.4 儲存憑證
⚠️ **重要**: 這是唯一一次可以看到 Secret Access Key 的機會！

1. 複製 `Access key ID`
2. 複製 `Secret access key`
3. 或點擊 "Download .csv" 下載憑證檔案

**請妥善保管這些憑證，不要提交到 Git！**

---

## 步驟 2: 配置 AWS CLI (Step 2: Configure AWS CLI)

### 2.1 安裝 AWS CLI

**macOS:**
```bash
brew install awscli
```

**Windows:**
下載並安裝: https://aws.amazon.com/cli/

**Linux (Ubuntu/Debian):**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### 2.2 設定 AWS 憑證
```bash
aws configure
```

輸入以下資訊:
```
AWS Access Key ID [None]: YOUR_ACCESS_KEY_ID
AWS Secret Access Key [None]: YOUR_SECRET_ACCESS_KEY
Default region name [None]: ap-northeast-1
Default output format [None]: json
```

### 2.3 驗證設定
```bash
aws sts get-caller-identity
```

應該會看到類似的輸出:
```json
{
    "UserId": "AIDAXXXXXXXXXXXXX",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/github-actions-deployer"
}
```

---

## 步驟 3: 設定 GitHub Repository (Step 3: Setup GitHub Repository)

### 3.1 建立 GitHub Repository
1. 前往 https://github.com/new
2. Repository name: `gitgiggle` (或你喜歡的名稱)
3. 選擇 Public 或 Private
4. **不要** 初始化 README, .gitignore 或 license
5. 點擊 "Create repository"

### 3.2 初始化本地 Git Repository
```bash
cd /path/to/class-reservation-system

# 初始化 Git
git init

# 添加 .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.npm/

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
*.tgz

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# AWS
.aws/
cdk.out/
*.zip

# Logs
logs/
*.log
npm-debug.log*

# Temporary files
.temp/
tmp/
EOF

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Class Reservation System"

# 設定遠端 repository
git remote add origin https://github.com/egg4lab/gitgiggle.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

---

## 步驟 4: 設定 GitHub Secrets (Step 4: Configure GitHub Secrets)

### 4.1 添加 AWS 憑證到 GitHub Secrets

1. 前往你的 GitHub repository
2. 點擊 "Settings" (設定)
3. 左側選單點擊 "Secrets and variables" → "Actions"
4. 點擊 "New repository secret"

**添加以下 3 個 secrets:**

#### Secret 1: AWS_ACCESS_KEY_ID
- Name: `AWS_ACCESS_KEY_ID`
- Value: 你的 AWS Access Key ID (步驟 1.4 複製的)

#### Secret 2: AWS_SECRET_ACCESS_KEY
- Name: `AWS_SECRET_ACCESS_KEY`
- Value: 你的 AWS Secret Access Key (步驟 1.4 複製的)

#### Secret 3: AWS_REGION
- Name: `AWS_REGION`
- Value: `ap-northeast-1`

### 4.2 (可選) 添加其他 Secrets

#### COACH_SECRET (用於 Admin API 認證)
- Name: `COACH_SECRET`
- Value: 創建一個強密碼 (例如: `CoachSecret2024!@#$`)

#### SES_FROM_EMAIL (用於發送郵件)
- Name: `SES_FROM_EMAIL`
- Value: 你的驗證郵箱地址 (例如: `coach@example.com`)

---

## 步驟 5: 驗證 SES 郵箱 (Step 5: Verify SES Email)

### 5.1 驗證發件人郵箱
```bash
aws ses verify-email-identity --email-address your-coach-email@example.com --region ap-northeast-1
```

### 5.2 檢查驗證郵件
1. 檢查你的郵箱收件匣
2. 找到來自 Amazon SES 的驗證郵件
3. 點擊郵件中的驗證連結

### 5.3 確認驗證狀態
```bash
aws ses get-identity-verification-attributes \
  --identities your-coach-email@example.com \
  --region ap-northeast-1
```

輸出應該顯示 "VerificationStatus": "Success"

### 5.4 (可選) 移出 SES Sandbox 模式

預設情況下，SES 在 sandbox 模式下只能發送郵件給已驗證的地址。

要移出 sandbox:
1. 前往 AWS SES Console: https://console.aws.amazon.com/ses/
2. 點擊 "Account dashboard"
3. 點擊 "Request production access"
4. 填寫申請表單
5. 等待 AWS 審核 (通常 24 小時內)

---

## 步驟 6: 部署基礎設施 (Step 6: Deploy Infrastructure)

### 6.1 Bootstrap AWS CDK (首次使用時)
```bash
cd infrastructure
npm install
npx cdk bootstrap aws://YOUR-ACCOUNT-ID/ap-northeast-1
```

### 6.2 部署 CDK Stack
```bash
npm run deploy
```

這會創建:
- ✅ DynamoDB 表格 (Students, Sessions, GroupClasses, Availability)
- ✅ Lambda 函數
- ✅ API Gateway
- ✅ S3 儲存桶
- ✅ CloudFront 分發

### 6.3 記錄輸出的 URL
部署完成後，你會看到類似的輸出:
```
Outputs:
ClassReservationStack.ApiEndpoint = https://xxxxx.execute-api.ap-northeast-1.amazonaws.com/prod/
ClassReservationStack.FrontendBucket = class-reservation-frontend-123456789012
ClassReservationStack.CloudFrontDistribution = dxxxxx.cloudfront.net
```

**複製這些 URL，稍後會用到！**

---

## 步驟 7: 更新前端環境變數 (Step 7: Update Frontend Environment)

### 7.1 創建 .env 檔案
```bash
cd frontend

cat > .env << EOF
REACT_APP_API_ENDPOINT=https://xxxxx.execute-api.ap-northeast-1.amazonaws.com/prod
REACT_APP_REGION=ap-northeast-1
EOF
```

**將上面的 `xxxxx` 替換為步驟 6.3 的實際 API Endpoint！**

---

## 步驟 8: 測試自動部署 (Step 8: Test Automated Deployment)

### 8.1 推送代碼觸發 GitHub Actions
```bash
git add .
git commit -m "Add environment configuration"
git push origin main
```

### 8.2 查看部署進度
1. 前往 GitHub repository
2. 點擊 "Actions" 標籤
3. 查看 "Deploy to AWS" workflow 的執行狀態

### 8.3 確認部署成功
當所有步驟顯示綠色 ✅ 時，部署就成功了！

---

## 步驟 9: 創建第一個學生帳號 (Step 9: Create First Student)

### 9.1 使用 AWS CLI 創建學生
```bash
# 設定 API Gateway URL
API_URL="https://xxxxx.execute-api.ap-northeast-1.amazonaws.com/prod"
COACH_SECRET="your-coach-secret-from-step-4.2"

# 創建學生
curl -X POST "${API_URL}/admin/students" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${COACH_SECRET}" \
  -d '{
    "name": "Test Student",
    "email": "student@example.com",
    "passcode": "test123"
  }'
```

### 9.2 或使用 AWS DynamoDB Console
1. 前往 AWS DynamoDB Console
2. 選擇 `class-reservation-students` 表格
3. 點擊 "Create item"
4. 添加以下屬性:
   - `studentId`: 生成 UUID (例如: `550e8400-e29b-41d4-a716-446655440000`)
   - `name`: 學生姓名
   - `email`: 學生郵箱
   - `passcode`: 簡單密碼 (例如: `test123`)
   - `createdAt`: 當前時間戳

---

## 步驟 10: 訪問應用程式 (Step 10: Access Application)

### 10.1 取得前端 URL

**CloudFront URL (推薦):**
```
https://dxxxxx.cloudfront.net
```

**S3 Static Website URL:**
```
http://class-reservation-frontend-123456789012.s3-website-ap-northeast-1.amazonaws.com
```

### 10.2 登入測試
1. 打開前端 URL
2. 使用步驟 9.1 創建的密碼登入
3. 查看日曆並預約課程

---

## 🎉 完成！ (Completed!)

你的課程預約系統現在已經完全設置好了！

### 系統功能:
- ✅ 學生登入系統
- ✅ 查看可預約時段
- ✅ 預約 1-on-1 課程
- ✅ 取消課程 (需提前 2 小時)
- ✅ 查看所有預約 (隱私保護)
- ✅ 郵件通知
- ✅ 三地點自動排程
- ✅ 自動部署 (push to GitHub → auto deploy)

---

## 疑難排解 (Troubleshooting)

### 問題 1: GitHub Actions 失敗
**檢查:**
- AWS Secrets 是否正確設定
- IAM 使用者權限是否足夠
- CDK 是否成功 bootstrap

### 問題 2: API 返回 403 Forbidden
**檢查:**
- Lambda 執行角色權限
- API Gateway CORS 設定
- DynamoDB 表格權限

### 問題 3: 郵件未發送
**檢查:**
- SES 郵箱是否已驗證
- SES 是否在 sandbox 模式
- Lambda 是否有 SES 權限

### 問題 4: 前端無法連接 API
**檢查:**
- `.env` 檔案中的 API endpoint 是否正確
- API Gateway 是否已部署
- CORS 設定是否正確

---

## 後續優化建議 (Future Improvements)

1. **自定義域名:**
   - 購買域名 (例如: booking.yourcoach.com)
   - 配置 Route 53
   - 設定 SSL 憑證 (AWS Certificate Manager)

2. **增強安全性:**
   - 啟用 AWS WAF
   - 實現 JWT token 刷新機制
   - 添加 rate limiting

3. **監控和日誌:**
   - 設定 CloudWatch 警報
   - 啟用 X-Ray 追蹤
   - 建立 dashboard

4. **效能優化:**
   - 啟用 DynamoDB Auto Scaling
   - 配置 CloudFront 快取策略
   - 優化 Lambda 記憶體配置

---

## 支援 (Support)

遇到問題? 查看:
- AWS 文件: https://docs.aws.amazon.com/
- GitHub Actions 文件: https://docs.github.com/actions
- CDK 文件: https://docs.aws.amazon.com/cdk/

**祝您使用愉快！ Good luck!** 🚀
