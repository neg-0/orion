import axios from 'axios';
import { useState } from 'react';

const AuthForm = ({ endpoint, title }: { endpoint: string; title: string }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await axios.post(`/api/${endpoint}`, { username, password });
    console.log(response.data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{title}</h2>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Submit</button>
    </form>
  );
};

export const LoginForm = () => <AuthForm endpoint="login" title="Login" />;
export const RegisterForm = () => <AuthForm endpoint="register" title="Register" />;
