import React, { useEffect, useState } from "react";

function QuizList({ apiBase, onSelect }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${apiBase}/api/quizzes`)
      .then((res) => res.json())
      .then((data) => {
        setQuizzes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load quizzes:", err);
        setLoading(false);
      });
  }, [apiBase]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    return `${m} min`;
  };

  if (loading) return <div className="loading">Loading quizzes...</div>;

  return (
    <div className="quiz-list">
      <h2>Choose a Quiz</h2>
      <div className="quiz-grid">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="quiz-card" onClick={() => onSelect(quiz)}>
            <h3>{quiz.title}</h3>
            <p>{quiz.description}</p>
            <div className="quiz-card-meta">
              <span>{quiz.questionCount} questions</span>
              <span>{formatTime(quiz.timeLimit)}</span>
            </div>
          </div>
        ))}
        {quizzes.length === 0 && (
          <p style={{ color: "#94a3b8" }}>No quizzes available yet.</p>
        )}
      </div>
    </div>
  );
}

export default QuizList;
