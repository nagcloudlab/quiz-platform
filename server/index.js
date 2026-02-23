require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { saveResult } = require("./sheets");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve React build in production
app.use(express.static(path.join(__dirname, "../client/build")));

// GET /api/quizzes - List all available quizzes
app.get("/api/quizzes", (req, res) => {
  const quizDir = path.join(__dirname, "quizzes");
  const files = fs.readdirSync(quizDir).filter((f) => f.endsWith(".json"));

  const quizzes = files.map((file) => {
    const data = JSON.parse(fs.readFileSync(path.join(quizDir, file), "utf-8"));
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      questionCount: data.questions.length,
      timeLimit: data.timeLimit,
    };
  });

  res.json(quizzes);
});

// GET /api/quizzes/:id - Get a quiz (without answers for students)
app.get("/api/quizzes/:id", (req, res) => {
  const quizDir = path.join(__dirname, "quizzes");
  const files = fs.readdirSync(quizDir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(quizDir, file), "utf-8"));
    if (data.id === req.params.id) {
      // Strip answers and explanations for students
      const sanitized = {
        ...data,
        questions: data.questions.map(({ answer, explanation, ...q }) => q),
      };
      return res.json(sanitized);
    }
  }

  res.status(404).json({ error: "Quiz not found" });
});

// POST /api/quizzes/:id/submit - Submit quiz answers
app.post("/api/quizzes/:id/submit", async (req, res) => {
  const { studentName, answers, timeTaken } = req.body;

  if (!studentName || !answers) {
    return res.status(400).json({ error: "studentName and answers are required" });
  }

  // Load quiz with answers
  const quizDir = path.join(__dirname, "quizzes");
  const files = fs.readdirSync(quizDir).filter((f) => f.endsWith(".json"));

  let quiz = null;
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(quizDir, file), "utf-8"));
    if (data.id === req.params.id) {
      quiz = data;
      break;
    }
  }

  if (!quiz) {
    return res.status(404).json({ error: "Quiz not found" });
  }

  // Grade the quiz
  let score = 0;
  const detailedAnswers = quiz.questions.map((q) => {
    const studentAnswer = answers[q.id];
    const isCorrect = studentAnswer === q.answer;
    if (isCorrect) score++;

    return {
      questionId: q.id,
      question: q.question,
      selected: studentAnswer !== undefined ? studentAnswer : -1,
      correctAnswer: q.answer,
      correct: isCorrect,
      explanation: q.explanation,
      options: q.options,
      code: q.code || null,
    };
  });

  const percentage = Math.round((score / quiz.questions.length) * 100);

  const result = {
    studentName,
    quizId: quiz.id,
    quizTitle: quiz.title,
    score,
    totalQuestions: quiz.questions.length,
    percentage,
    timeTaken: timeTaken || 0,
    answers: detailedAnswers,
  };

  // Save to Google Sheets
  const sheetResult = await saveResult(result);

  res.json({
    ...result,
    sheetsSaved: sheetResult.saved,
  });
});

// Catch-all: serve React app for any non-API route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Quiz server running on http://localhost:${PORT}`);
  console.log(
    `Google Sheets: ${process.env.GOOGLE_SHEETS_ID ? "Configured" : "Not configured (results will not be saved to sheets)"}`
  );
});
