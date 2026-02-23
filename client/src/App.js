import React, { useState } from "react";
import Welcome from "./components/Welcome";
import QuizList from "./components/QuizList";
import Quiz from "./components/Quiz";
import Results from "./components/Results";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_URL || "";

function App() {
  const [screen, setScreen] = useState("welcome"); // welcome | quizList | quiz | results
  const [studentName, setStudentName] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [results, setResults] = useState(null);

  const handleNameSubmit = (name) => {
    setStudentName(name);
    setScreen("quizList");
  };

  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
    setScreen("quiz");
  };

  const handleQuizSubmit = (resultData) => {
    setResults(resultData);
    setScreen("results");
  };

  const handleBackToQuizzes = () => {
    setSelectedQuiz(null);
    setResults(null);
    setScreen("quizList");
  };

  const handleStartOver = () => {
    setStudentName("");
    setSelectedQuiz(null);
    setResults(null);
    setScreen("welcome");
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 onClick={handleStartOver} style={{ cursor: "pointer" }}>
          Quiz Platform
        </h1>
        {studentName && <span className="student-badge">{studentName}</span>}
      </header>

      <main className="app-main">
        {screen === "welcome" && <Welcome onSubmit={handleNameSubmit} />}

        {screen === "quizList" && (
          <QuizList apiBase={API_BASE} onSelect={handleQuizSelect} />
        )}

        {screen === "quiz" && selectedQuiz && (
          <Quiz
            apiBase={API_BASE}
            quizMeta={selectedQuiz}
            studentName={studentName}
            onSubmit={handleQuizSubmit}
            onBack={handleBackToQuizzes}
          />
        )}

        {screen === "results" && results && (
          <Results results={results} onBackToQuizzes={handleBackToQuizzes} />
        )}
      </main>
    </div>
  );
}

export default App;
