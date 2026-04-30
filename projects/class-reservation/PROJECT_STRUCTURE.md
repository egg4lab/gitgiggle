# 專案結構 Project Structure

```
class-reservation-system/
│
├── README.md                          # 專案說明文件
├── AWS_GITHUB_SETUP.md               # AWS + GitHub 完整設定指南
├── deploy.sh                          # 快速部署腳本
├── .gitignore                         # Git 忽略文件
│
├── .github/
│   └── workflows/
│       └── deploy.yml                 # GitHub Actions 自動部署
│
├── frontend/                          # React 前端應用
│   ├── package.json                   # 前端依賴
│   ├── vite.config.js                # Vite 配置
│   ├── index.html                    # HTML 入口
│   ├── .env                          # 環境變數 (需手動創建)
│   │
│   └── src/
│       ├── App.jsx                   # 主應用組件
│       ├── main.jsx                  # 應用入口
│       │
│       ├── components/               # React 組件
│       │   ├── LoginModal.jsx       # 登入彈窗
│       │   ├── BookingModal.jsx     # 預約彈窗
│       │   ├── StudentScheduleModal.jsx  # 學生日程表
│       │   └── Calendar.jsx         # 日曆組件
│       │
│       ├── store/                    # 狀態管理
│       │   └── authStore.js         # 認證狀態
│       │
│       ├── services/                 # API 服務
│       │   └── api.js               # API 請求函數
│       │
│       ├── utils/                    # 工具函數
│       │   └── date.js              # 日期處理
│       │
│       └── styles/                   # 樣式文件
│           └── App.css              # 主樣式
│
├── backend/                          # Node.js 後端
│   ├── package.json                  # 後端依賴
│   ├── .env                         # 環境變數 (需手動創建)
│   │
│   └── src/
│       ├── index.js                 # Lambda 主處理器
│       │
│       ├── handlers/                # API 處理器
│       │   ├── auth.js             # 認證處理
│       │   ├── sessions.js         # 課程管理
│       │   ├── availability.js     # 可用性查詢
│       │   ├── groupClasses.js     # 團體課程
│       │   └── admin.js            # 管理功能
│       │
│       ├── services/                # 業務邏輯
│       │   └── email.js            # 郵件服務 (AWS SES)
│       │
│       └── utils/                   # 工具函數
│           └── scheduling.js        # 排程邏輯
│
└── infrastructure/                   # AWS CDK 基礎設施
    ├── package.json                 # CDK 依賴
    ├── cdk.json                    # CDK 配置
    │
    ├── bin/
    │   └── app.ts                  # CDK 應用入口
    │
    └── lib/
        └── infrastructure-stack.ts  # CDK Stack 定義
            ├── DynamoDB Tables     # 資料庫表格
            ├── Lambda Functions    # 無伺服器函數
            ├── API Gateway        # REST API
            ├── S3 Bucket         # 前端託管
            └── CloudFront        # CDN 分發
```

## 核心文件說明 Core Files Description

### 配置文件 Configuration Files

#### `frontend/.env`
```env
REACT_APP_API_ENDPOINT=https://xxxxx.execute-api.ap-northeast-1.amazonaws.com/prod
REACT_APP_REGION=ap-northeast-1
```

#### `backend/.env`
```env
AWS_REGION=ap-northeast-1
STUDENTS_TABLE=class-reservation-students
SESSIONS_TABLE=class-reservation-sessions
GROUP_CLASSES_TABLE=class-reservation-group-classes
AVAILABILITY_TABLE=class-reservation-availability
SES_FROM_EMAIL=coach@example.com
COACH_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret
```

### AWS 資源 AWS Resources

#### DynamoDB Tables
1. **Students** - 學生資料
   - PK: studentId
   - GSI: passcode-index

2. **Sessions** - 1-on-1 課程
   - PK: sessionId
   - SK: startTime
   - GSI: student-sessions-index, location-time-index

3. **GroupClasses** - 團體課程
   - PK: classId
   - SK: startTime

4. **Availability** - 教練可用時間
   - PK: availabilityId
   - SK: startTime

#### Lambda Functions
- **class-reservation-api** - 單一 Lambda 處理所有 API 請求

#### API Gateway Endpoints
```
POST   /auth/login                    # 學生登入
GET    /availability                  # 查詢可用時段
GET    /sessions                      # 查詢所有課程
POST   /sessions                      # 預約課程
DELETE /sessions/{id}                 # 取消課程
GET    /sessions/student/{studentId}  # 查詢學生課程
GET    /group-classes                 # 查詢團體課程
POST   /admin/students                # 創建學生 (教練)
GET    /admin/students                # 查詢所有學生 (教練)
```

## 開發工作流程 Development Workflow

### 本地開發 Local Development

```bash
# 1. 啟動前端開發伺服器
cd frontend
npm install
npm run dev
# http://localhost:5173

# 2. (可選) 啟動後端本地測試
cd backend
npm install
npm run dev
# http://localhost:3001
```

### 部署到 AWS Deploy to AWS

#### 方法 1: 使用快速部署腳本
```bash
./deploy.sh
```

#### 方法 2: 手動部署
```bash
# 1. 部署基礎設施
cd infrastructure
npm install
npm run deploy

# 2. 部署前端
cd ../frontend
npm install
npm run build
aws s3 sync dist/ s3://YOUR-BUCKET-NAME/

# 3. 更新 Lambda 函數
cd ../backend
npm install --production
zip -r function.zip .
aws lambda update-function-code \
  --function-name class-reservation-api \
  --zip-file fileb://function.zip
```

#### 方法 3: GitHub Actions 自動部署
```bash
git add .
git commit -m "Your commit message"
git push origin main
# GitHub Actions 會自動部署
```

## 環境變數 Environment Variables

### GitHub Secrets (必須設定)
- `AWS_ACCESS_KEY_ID` - AWS 存取金鑰 ID
- `AWS_SECRET_ACCESS_KEY` - AWS 秘密存取金鑰
- `AWS_REGION` - AWS 區域 (ap-northeast-1)

### 可選 Secrets (Optional)
- `COACH_SECRET` - 教練 API 認證密鑰
- `SES_FROM_EMAIL` - 郵件發送地址

## 安全性注意事項 Security Notes

⚠️ **重要**: 以下文件包含敏感資訊，絕對不要提交到 Git！

- `frontend/.env`
- `backend/.env`
- `.aws/credentials`
- 任何包含 API keys 或密碼的文件

這些文件已經在 `.gitignore` 中被排除。

## 監控和日誌 Monitoring & Logs

### CloudWatch Logs
- Lambda 函數日誌: `/aws/lambda/class-reservation-api`
- API Gateway 日誌: 在 API Gateway console 啟用

### 查看日誌
```bash
# Lambda 日誌
aws logs tail /aws/lambda/class-reservation-api --follow

# API Gateway 日誌需在 Console 中查看
```

## 成本估算 Cost Estimation

基於小規模使用 (20 學生, 100 次預約/月):

| 服務 Service | 預估成本 Estimated Cost |
|-------------|----------------------|
| DynamoDB | $1-2 / 月 |
| Lambda | $0.5-1 / 月 |
| API Gateway | $1-2 / 月 |
| S3 | $0.5-1 / 月 |
| CloudFront | $1-2 / 月 |
| SES | $0.1 / 月 |
| **總計 Total** | **$4-9 / 月** |

💡 **提示**: 使用 AWS Free Tier 可免費使用大部分服務一年！

## 支援與問題 Support & Issues

如果遇到問題:
1. 檢查 `AWS_GITHUB_SETUP.md` 中的疑難排解章節
2. 查看 CloudWatch Logs
3. 檢查 GitHub Actions 執行日誌
4. 確認所有環境變數正確設定

## 授權 License

MIT License - 自由使用和修改
