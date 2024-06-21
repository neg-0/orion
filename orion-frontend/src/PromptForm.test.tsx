import { fireEvent, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import PromptForm from './PromptForm';
import store from './store';

test('renders PromptForm and submits prompt', () => {
  const { getByPlaceholderText, getByText } = render(
    <Provider store={store}>
      <PromptForm />
    </Provider>
  );

  const textarea = getByPlaceholderText('Enter your prompt here...');
  fireEvent.change(textarea, { target: { value: 'Test prompt' } });

  const button = getByText('Send');
  fireEvent.click(button);

  expect(store.getState().prompt.status).toBe('loading');
});
