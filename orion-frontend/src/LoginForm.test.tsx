import { fireEvent, render } from '@testing-library/react';
import { LoginForm } from './LoginForm';

test('renders login form and submits', () => {
  const { getByPlaceholderText, getByText } = render(<LoginForm />);
  fireEvent.change(getByPlaceholderText('Username'), { target: { value: 'testuser' } });
  fireEvent.change(getByPlaceholderText('Password'), { target: { value: 'password' } });
  fireEvent.click(getByText('Submit'));
});