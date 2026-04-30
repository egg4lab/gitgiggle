# Class Calendar Demo

Run the class reservation calendar locally **without** an AWS backend. The app uses mock data so you can see the UI and flow immediately.

## Prerequisites

- **Node.js 20+** (and npm, usually included)

## Steps

### 1. Open a terminal in the project

```bash
cd class-reservation-system
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Start the dev server

```bash
npm run dev
```

### 4. Open the app

In your browser, go to the URL Vite prints (e.g. **http://localhost:5173**).

### 5. Log in (demo)

- Enter **any passcode** (e.g. `demo` or `1234`).
- Click **登入 / Login**.

### 6. Use the calendar

- **Views**: Switch between Month, Week, and Day (toolbar above the calendar).
- **Location colors**:
  - Taipei (Mon–Tue)
  - Yi-Lan (Wed–Thu)
  - Hsin-Chu (Fri–Sun)
- **Book a slot**: Click an empty time slot → confirm in the modal. In demo mode this does not call a real API.
- **My Schedule**: Small panel (bottom-right) is for “My Schedule”; the main interaction is the calendar.

## What’s in demo mode

- **Login**: Any passcode is accepted.
- **Availability**: Mock slots for the next 4 weeks, 9:00–20:00, by location schedule.
- **Events**: Sample 1-on-1 sessions and group classes (e.g. “Group Class (2/8)”).
- **Booking**: Confirmation only; no backend or email.

## How to find the API Gateway URL

Use any of these after the CDK stack is deployed:

### Option 1: After deploying (terminal)

When you run `npm run deploy` in `infrastructure/`, the URL is printed at the end:

```
Outputs:
ClassReservationStack.ApiEndpoint = https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/prod/
```

Use that URL **without** the trailing slash for `VITE_API_ENDPOINT` (e.g. `https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/prod`).

### Option 2: AWS Console

1. Open [AWS CloudFormation](https://console.aws.amazon.com/cloudformation).
2. Select the stack **ClassReservationStack**.
3. Open the **Outputs** tab.
4. Copy the value of **ApiEndpoint**.

### Option 3: AWS CLI

```bash
aws cloudformation describe-stacks \
  --stack-name ClassReservationStack \
  --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
  --output text
```

Use the printed URL (no trailing slash) as your API Gateway URL.

---

## Switching to the real backend

1. Get the API Gateway URL (see **How to find the API Gateway URL** above).
2. Create `frontend/.env`:
   ```env
   VITE_API_ENDPOINT=https://YOUR_API_GATEWAY_URL/prod
   ```
   (If the URL already ends with `/prod`, use it as-is; otherwise add `/prod`.)
3. Restart the dev server (`npm run dev`).

The same app will then use your AWS API instead of mock data.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `npm` not found | Install Node.js from [nodejs.org](https://nodejs.org) or use nvm; restart the terminal. |
| Port 5173 in use | Vite will offer another port (e.g. 5174); use that URL. |
| Blank or broken calendar | Hard refresh (Ctrl+F5) and check the browser console for errors. |

---

For full deployment (AWS + GitHub), see **AWS_GITHUB_SETUP.md** and **QUICKSTART.md**.
