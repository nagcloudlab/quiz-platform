import React, { useEffect, useState, useCallback, useRef } from "react";

function Quiz({ apiBase, quizMeta, studentName, onSubmit, onBack }) {
  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quizMeta.timeLimit);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  // Load quiz questions
  useEffect(() => {
    fetch(`${apiBase}/api/quizzes/${quizMeta.id}`)
      .then((res) => res.json())
      .then((data) => setQuiz(data))
      .catch((err) => console.error("Failed to load quiz:", err));
  }, [apiBase, quizMeta.id]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);

    try {
      const res = await fetch(`${apiBase}/api/quizzes/${quizMeta.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName, answers, timeTaken }),
      });
      const data = await res.json();
      onSubmit(data);
    } catch (err) {
      console.error("Failed to submit:", err);
      setSubmitting(false);
    }
  }, [apiBase, quizMeta.id, studentName, answers, onSubmit, submitting]);

  // Timer
  useEffect(() => {
    if (!quiz) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quiz, handleSubmit]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getTimerClass = () => {
    if (timeLeft <= 30) return "timer danger";
    if (timeLeft <= 60) return "timer warning";
    return "timer";
  };

  const selectOption = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  if (!quiz) return <div className="loading">Loading quiz...</div>;

  const question = quiz.questions[currentQ];
  const totalQ = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div>
          <h2>{quiz.title}</h2>
          <button
            className="btn btn-secondary"
            style={{ marginTop: 8, padding: "6px 12px", fontSize: "0.8rem" }}
            onClick={onBack}
          >
            Exit Quiz
          </button>
        </div>
        <div className={getTimerClass()}>{formatTime(timeLeft)}</div>
      </div>

      <div className="quiz-progress">
        <span>
          {answeredCount}/{totalQ} answered
        </span>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(answeredCount / totalQ) * 100}%` }}
          />
        </div>
      </div>

      <div className="question-card">
        <div className="question-number">
          Question {currentQ + 1} of {totalQ}
        </div>
        <div className="question-text">{question.question}</div>

        {question.code && <div className="code-block">{question.code}</div>}

        <div className="options">
          {question.options.map((opt, i) => (
            <div
              key={i}
              className={`option ${answers[question.id] === i ? "selected" : ""}`}
              onClick={() => selectOption(question.id, i)}
            >
              <span className="option-marker">
                {String.fromCharCode(65 + i)}
              </span>
              <span>{opt}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="quiz-nav">
        <button
          className="btn btn-secondary"
          onClick={() => setCurrentQ((p) => p - 1)}
          disabled={currentQ === 0}
        >
          Previous
        </button>

        <div style={{ display: "flex", gap: 6 }}>
          {quiz.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: i === currentQ ? "2px solid #38bdf8" : "1px solid #475569",
                background: answers[quiz.questions[i].id] !== undefined ? "#38bdf8" : "#1e293b",
                color: answers[quiz.questions[i].id] !== undefined ? "#0f172a" : "#94a3b8",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentQ < totalQ - 1 ? (
          <button
            className="btn btn-primary"
            onClick={() => setCurrentQ((p) => p + 1)}
          >
            Next
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        )}
      </div>
    </div>
  );
}

export default Quiz;
