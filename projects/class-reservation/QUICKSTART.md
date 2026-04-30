# 🚀 快速開始指南 Quick Start Guide

## 中文版 Chinese Version

### 🎯 系統概述
這是一個完整的課程預約系統，支援：
- 三個上課地點的自動排程 (台北、宜蘭、新竹)
- 學生密碼登入
- 1對1課程預約 (100分鐘)
- 團體課程顯示
- 郵件通知
- 行事曆視圖

### ⚡ 5分鐘快速部署

#### 前置需求
- AWS 帳號
- Node.js 20+
- Git

#### 步驟 1: 下載並解壓縮專案
```bash
# 解壓縮下載的檔案
tar -xzf class-reservation-system.tar.gz
cd class-reservation-system
```

#### 步驟 2: 設定 AWS
```bash
# 安裝 AWS CLI (如果還沒安裝)
# macOS: brew install awscli
# Windows: 從 https://aws.amazon.com/cli/ 下載

# 設定 AWS 憑證
aws configure
# 輸入:
# - AWS Access Key ID
# - AWS Secret Access Key  
# - Region: ap-northeast-1
# - Output format: json
```

#### 步驟 3: 一鍵部署
```bash
# 執行自動部署腳本
./deploy.sh
```

腳本會自動完成：
1. ✅ 安裝所有依賴
2. ✅ 部署 AWS 基礎設施
3. ✅ 建置並部署前端
4. ✅ 設定郵件服務

#### 步驟 4: 驗證郵箱
1. 檢查收件匣
2. 點擊 AWS SES 驗證連結

#### 步驟 5: 創建第一個學生帳號

**方法A - 使用 API:**
```bash
curl -X POST "YOUR_API_ENDPOINT/admin/students" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_COACH_SECRET" \
  -d '{
    "name": "測試學生",
    "email": "student@example.com",
    "passcode": "test123"
  }'
```

**方法B - 使用 AWS Console:**
1. 前往 DynamoDB Console
2. 選擇 `class-reservation-students` 表格
3. 點擊 "Create item"
4. 添加學生資料

#### 步驟 6: 開始使用！
1. 打開部署後顯示的 URL (https://xxxxx.cloudfront.net)
2. 使用密碼 `test123` 登入
3. 在行事曆上點擊可用時段預約課程

---

## English Version

### 🎯 System Overview
A complete class reservation system with:
- Automatic scheduling across 3 locations (Taipei, Yi-Lan, Hsin-Chu)
- Student passcode authentication
- 1-on-1 session booking (100 minutes)
- Group class display
- Email notifications
- Calendar view

### ⚡ 5-Minute Quick Deploy

#### Prerequisites
- AWS Account
- Node.js 20+
- Git

#### Step 1: Download and Extract
```bash
# Extract the downloaded file
tar -xzf class-reservation-system.tar.gz
cd class-reservation-system
```

#### Step 2: Configure AWS
```bash
# Install AWS CLI (if not already installed)
# macOS: brew install awscli
# Windows: Download from https://aws.amazon.com/cli/

# Configure AWS credentials
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Region: ap-northeast-1
# - Output format: json
```

#### Step 3: One-Click Deploy
```bash
# Run the automated deployment script
./deploy.sh
```

The script automatically:
1. ✅ Installs all dependencies
2. ✅ Deploys AWS infrastructure
3. ✅ Builds and deploys frontend
4. ✅ Configures email service

#### Step 4: Verify Email
1. Check your inbox
2. Click the AWS SES verification link

#### Step 5: Create First Student Account

**Method A - Using API:**
```bash
curl -X POST "YOUR_API_ENDPOINT/admin/students" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_COACH_SECRET" \
  -d '{
    "name": "Test Student",
    "email": "student@example.com",
    "passcode": "test123"
  }'
```

**Method B - Using AWS Console:**
1. Go to DynamoDB Console
2. Select `class-reservation-students` table
3. Click "Create item"
4. Add student data

#### Step 6: Start Using!
1. Open the deployed URL (https://xxxxx.cloudfront.net)
2. Login with passcode `test123`
3. Click on available time slots in the calendar to book

---

## 📁 專案文件 Project Files

| 文件 File | 說明 Description |
|-----------|------------------|
| `README.md` | 完整專案說明 Complete project documentation |
| `AWS_GITHUB_SETUP.md` | AWS + GitHub 詳細設定 Detailed AWS + GitHub setup |
| `PROJECT_STRUCTURE.md` | 專案結構說明 Project structure explanation |
| `deploy.sh` | 自動部署腳本 Automated deployment script |

---

## 🔧 GitHub 自動部署設定 GitHub Auto-Deployment Setup

### 步驟 1: 推送到 GitHub
```bash
# 初始化 Git repository
git init
git add .
git commit -m "Initial commit"

# 連接到你的 GitHub repo
git remote add origin https://github.com/egg4lab/gitgiggle.git
git branch -M main
git push -u origin main
```

### 步驟 2: 添加 GitHub Secrets
1. 前往: `https://github.com/egg4lab/gitgiggle/settings/secrets/actions`
2. 添加以下 secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION` (值: ap-northeast-1)

### 步驟 3: 自動部署已啟用！
現在每次 push 到 main branch，GitHub Actions 會自動：
1. 測試代碼
2. 部署基礎設施
3. 更新 Lambda 函數
4. 部署前端到 S3/CloudFront

---

## 🎨 系統功能 System Features

### 學生端 Student Side
- ✅ 密碼登入
- ✅ 查看可用時段（依地點顏色標示）
- ✅ 預約 1-on-1 課程
- ✅ 查看個人行程
- ✅ 取消課程（需提前2小時）
- ✅ 查看所有預約（不顯示其他學生姓名）
- ✅ 查看團體課程

### 教練端 Coach Side
- ✅ 創建學生帳號
- ✅ 管理密碼
- ✅ 查看所有預約
- ✅ 取消課程並自動發送通知
- ✅ 設定不可用時段

### 地點排程 Location Schedule
- 🟦 **台北 Taipei**: 週一、週二 (Monday, Tuesday)
- 🟩 **宜蘭 Yi-Lan**: 週三、週四 (Wednesday, Thursday)
- 🟧 **新竹 Hsin-Chu**: 週五、週六、週日 (Friday, Saturday, Sunday)

---

## 📧 郵件通知 Email Notifications

系統會自動發送以下郵件：
- ✉️ 預約確認 Booking confirmation
- ✉️ 取消通知 Cancellation notice (需提前2小時)
- ✉️ 提醒通知 Reminder (課程前1天)

---

## 💰 預估費用 Estimated Costs

小規模使用（20學生，100次預約/月）：
- DynamoDB: ~$1-2/月
- Lambda: ~$0.5-1/月
- API Gateway: ~$1-2/月
- S3 + CloudFront: ~$1-2/月
- SES: ~$0.1/月

**總計約 $4-9/月**

💡 使用 AWS Free Tier 前12個月大部分免費！

---

## 🆘 需要幫助？ Need Help?

### 常見問題 Common Issues

**Q: GitHub Actions 部署失敗**
A: 檢查 GitHub Secrets 是否正確設定

**Q: 無法發送郵件**
A: 確認 SES 郵箱已驗證，並檢查是否在 sandbox 模式

**Q: API 返回 403**
A: 檢查 Lambda 執行角色權限和 API Gateway CORS 設定

**Q: 前端無法連接 API**
A: 確認 `.env` 文件中的 API endpoint 正確

### 詳細文檔 Detailed Documentation
- 完整設定指南: `AWS_GITHUB_SETUP.md`
- 專案結構說明: `PROJECT_STRUCTURE.md`
- API 文檔: `README.md`

---

## 🎉 完成！ Done!

您的課程預約系統已經準備就緒！

**接下來可以：**
1. 自定義品牌顏色和樣式
2. 添加更多功能
3. 設定自訂域名
4. 啟用進階監控

**祝您使用愉快！Enjoy!** 🚀

---

**聯繫方式 Contact:**
- GitHub Issues: https://github.com/egg4lab/gitgiggle/issues
- 系統由 Claude AI 協助建立 Built with Claude AI
