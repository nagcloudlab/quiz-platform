# Quiz Platform - Setup Guide

## Quick Start (No Google Sheets)

The platform works without Google Sheets - results just won't be saved to a spreadsheet.

```bash
# 1. Install backend dependencies
cd server
npm install

# 2. Install frontend dependencies
cd ../client
npm install

# 3. Start the backend (from server/)
cd ../server
npm run dev

# 4. In another terminal, start the frontend (from client/)
cd client
npm start
```

The app will open at http://localhost:3000

## Google Sheets Setup (Optional)

Follow these steps to save quiz results to Google Sheets:

### Step 1: Create a Google Cloud Project
1. Go to https://console.cloud.google.com/
2. Click "New Project" and give it a name (e.g., "Quiz Platform")
3. Select the project

### Step 2: Enable Google Sheets API
1. Go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click "Enable"

### Step 3: Create a Service Account
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Give it a name (e.g., "quiz-writer")
4. Click "Done"
5. Click on the service account you just created
6. Go to "Keys" tab > "Add Key" > "Create new key" > "JSON"
7. A JSON file will download - keep it safe!

### Step 4: Create a Google Sheet
1. Go to https://sheets.google.com
2. Create a new spreadsheet (e.g., "Quiz Results")
3. Copy the spreadsheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit`

### Step 5: Share the Sheet
1. Open the downloaded JSON key file
2. Copy the `client_email` value
3. Go back to your Google Sheet
4. Click "Share" and paste the service account email
5. Give it "Editor" access

### Step 6: Configure Environment
Edit `server/.env`:

```env
PORT=3001
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nCOPY_FROM_JSON_FILE\n-----END PRIVATE KEY-----\n"
```

Get the email and private key from the downloaded JSON file.

### Step 7: Restart the server
```bash
cd server
npm run dev
```

You should see "Google Sheets: Configured" in the console.

## Adding New Quizzes

Create a new JSON file in `server/quizzes/`. Follow this format:

```json
{
  "id": "unique-quiz-id",
  "title": "Quiz Title",
  "description": "Short description",
  "timeLimit": 600,
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "Your question here?",
      "code": "optional code snippet",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0,
      "explanation": "Why this is the correct answer"
    }
  ]
}
```

- `timeLimit`: in seconds (600 = 10 minutes)
- `answer`: zero-based index of the correct option (0 = first option)
- `code`: optional, for code snippet questions
- No server restart needed - quizzes are loaded on each request

## Production Deployment

### Option 1: Render (Free)
1. Push code to GitHub
2. Go to https://render.com
3. Create a new Web Service pointing to your repo
4. Build command: `cd client && npm install && npm run build && cd ../server && npm install`
5. Start command: `cd server && node index.js`
6. Add your env vars in the Render dashboard

### Option 2: Railway (Free)
1. Push code to GitHub
2. Go to https://railway.app
3. Deploy from GitHub repo
4. Set root directory to `server`
5. Add env vars in Railway dashboard
6. Build the React app and place in client/build before deploying

### Option 3: Vercel (Frontend) + Render (Backend)
1. Deploy `client/` to Vercel
2. Deploy `server/` to Render
3. Set `REACT_APP_API_URL` in Vercel to your Render URL
