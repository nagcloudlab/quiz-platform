const { google } = require("googleapis");

let sheetsClient = null;

function getAuth() {
  if (
    !process.env.GOOGLE_SHEETS_ID ||
    !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
    !process.env.GOOGLE_PRIVATE_KEY
  ) {
    return null;
  }

  const auth = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  );

  return auth;
}

function getSheetsClient() {
  if (sheetsClient) return sheetsClient;

  const auth = getAuth();
  if (!auth) return null;

  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
}

async function ensureSheetExists(sheets, sheetTitle) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

  try {
    const res = await sheets.spreadsheets.get({ spreadsheetId });
    const existing = res.data.sheets.map((s) => s.properties.title);

    if (!existing.includes(sheetTitle)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              addSheet: {
                properties: { title: sheetTitle },
              },
            },
          ],
        },
      });

      // Add header row
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetTitle}!A1`,
        valueInputOption: "RAW",
        resource: {
          values: [
            [
              "Timestamp",
              "Student Name",
              "Quiz",
              "Score",
              "Total Questions",
              "Percentage",
              "Time Taken (seconds)",
              "Answers Detail",
            ],
          ],
        },
      });
    }
  } catch (err) {
    console.error("Error ensuring sheet exists:", err.message);
    throw err;
  }
}

async function saveResult(result) {
  const sheets = getSheetsClient();

  if (!sheets) {
    console.log("Google Sheets not configured. Result saved locally only.");
    return { saved: false, reason: "Google Sheets not configured" };
  }

  const sheetTitle = "Quiz Results";
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

  try {
    await ensureSheetExists(sheets, sheetTitle);

    const answersDetail = result.answers
      .map(
        (a) =>
          `Q${a.questionId}: ${a.correct ? "Correct" : "Wrong"} (selected: ${a.selected}, answer: ${a.correctAnswer})`
      )
      .join(" | ");

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetTitle}!A1`,
      valueInputOption: "RAW",
      resource: {
        values: [
          [
            new Date().toISOString(),
            result.studentName,
            result.quizTitle,
            result.score,
            result.totalQuestions,
            `${result.percentage}%`,
            result.timeTaken,
            answersDetail,
          ],
        ],
      },
    });

    return { saved: true };
  } catch (err) {
    console.error("Error saving to Google Sheets:", err.message);
    return { saved: false, reason: err.message };
  }
}

module.exports = { saveResult };
