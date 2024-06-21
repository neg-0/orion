import AIResponse from './AIResponse';
import { LoginForm, RegisterForm } from './LoginForm';

const App = () => {
  return (
    <div>
      <h1>Orion</h1>
      <RegisterForm />
      <LoginForm />
      <AIResponse />
    </div>
  );
};

export default App;
