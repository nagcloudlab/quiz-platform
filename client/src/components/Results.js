import React from "react";

function Results({ results, onBackToQuizzes }) {
  const { score, totalQuestions, percentage, timeTaken, answers } = results;

  const getScoreClass = () => {
    if (percentage >= 80) return "high";
    if (percentage >= 50) return "medium";
    return "low";
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="results">
      <div className="results-summary">
        <h2 style={{ marginBottom: 24 }}>Quiz Complete!</h2>

        <div className={`score-circle ${getScoreClass()}`}>
          <span className="score-percent">{percentage}%</span>
          <span className="score-label">Score</span>
        </div>

        <div className="results-stats">
          <div className="stat">
            <div className="stat-value">
              {score}/{totalQuestions}
            </div>
            <div className="stat-label">Correct</div>
          </div>
          <div className="stat">
            <div className="stat-value">{formatTime(timeTaken)}</div>
            <div className="stat-label">Time Taken</div>
          </div>
          <div className="stat">
            <div className="stat-value">
              {results.sheetsSaved ? "Saved" : "Not saved"}
            </div>
            <div className="stat-label">Google Sheets</div>
          </div>
        </div>
      </div>

      <div className="results-detail">
        <h3>Question Review</h3>
        {answers.map((a, i) => (
          <div
            key={i}
            className={`result-question ${a.correct ? "correct" : "wrong"}`}
          >
            <div className="question-text">
              {i + 1}. {a.question}
            </div>

            {a.code && <div className="code-block">{a.code}</div>}

            {a.correct ? (
              <div className="result-answer correct-answer">
                Your answer: {a.options[a.selected]} - Correct!
              </div>
            ) : (
              <>
                <div className="result-answer wrong-answer">
                  Your answer:{" "}
                  {a.selected >= 0 ? a.options[a.selected] : "Not answered"}
                </div>
                <div className="result-answer correct-answer">
                  Correct answer: {a.options[a.correctAnswer]}
                </div>
              </>
            )}

            {a.explanation && (
              <div className="result-explanation">{a.explanation}</div>
            )}
          </div>
        ))}
      </div>

      <div className="results-actions">
        <button className="btn btn-primary" onClick={onBackToQuizzes}>
          Back to Quizzes
        </button>
      </div>
    </div>
  );
}

export default Results;
