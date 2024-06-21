import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import App from './App';

test('renders welcome message', () => {
  const { getByText } = render(<App />);
  expect(getByText(/Welcome to Orion/i)).toBeInTheDocument();
});
