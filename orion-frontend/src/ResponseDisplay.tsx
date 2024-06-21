import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from './store';

const ResponseDisplay: React.FC = () => {
  const { response, status, error } = useSelector((state: RootState) => state.prompt);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'failed') {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h2>AI Response:</h2>
      <p>{response}</p>
    </div>
  );
};

export default ResponseDisplay;
