import React, { useState } from "react";

function Welcome({ onSubmit }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="welcome">
      <h2>Welcome to Quiz Platform</h2>
      <p>Enter your name to get started</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
          Start
        </button>
      </form>
    </div>
  );
}

export default Welcome;
