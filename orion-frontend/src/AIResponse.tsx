import React, { useState } from 'react';
import axiosInstance from './axiosInstance';

const AIResponse = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<{ prompt: string, result: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await axiosInstance.post('/api/generate-code', { prompt });
      const result = res.data.result;

      setHistory([...history, { prompt, result }]);
      setResult(result);
      setPrompt('');
    } catch (err) {
      setError('Failed to generate code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt..."
        />
        <button type="submit" disabled={isLoading}>Submit</button>
      </form>
      {isLoading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <div>
        {history.map((entry, index) => (
          <div key={index}>
            <p><strong>Prompt:</strong> {entry.prompt}</p>
            <p><strong>Result:</strong> {entry.result}</p>
          </div>
        ))}
      </div>
      <div>
        <p><strong>Latest Result:</strong></p>
        <p>{result}</p>
      </div>
    </div>
  );
};

export default AIResponse;
