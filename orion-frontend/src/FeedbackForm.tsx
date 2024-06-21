import React, { useState } from 'react';

const FeedbackForm: React.FC = () => {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle feedback submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Enter your feedback here..."
      />
      <button type="submit">Submit Feedback</button>
    </form>
  );
};

export default FeedbackForm;
