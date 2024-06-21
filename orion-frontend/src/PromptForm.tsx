import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { sendPrompt } from './promptSlice';
import { AppDispatch } from './store'; // Import AppDispatch

const PromptForm: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const dispatch = useDispatch<AppDispatch>(); // Use AppDispatch type

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(sendPrompt(prompt));
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt here..."
      />
      <button type="submit">Send</button>
    </form>
  );
};

export default PromptForm;
