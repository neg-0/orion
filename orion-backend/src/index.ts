import bcrypt from 'bcrypt';
import { exec } from 'child_process';
import cors from 'cors';
import 'dotenv/config'; // Ensure this is at the very top
import express from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import openai from './openai.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/api/ai-response', async (req, res) => {
  const { prompt } = req.body;

  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
    });

    res.json({ result: chatCompletion.choices[0].message?.content });
  } catch (error) {
    handleError(error, res);
  }
});

app.post('/api/generate-code', async (req, res) => {
  const { prompt } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
    });

    const code = completion.choices[0].message?.content;
    const filePath = './generated_code.js';

    if (code !== null) {
      fs.writeFile(filePath, code, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to save code to file' });
        }

        exec(`node ${filePath}`, (error, stdout, stderr) => {
          if (error) {
            return res.status(500).json({ error: `Code execution failed: ${stderr}` });
          }

          res.json({ result: stdout });
        });
      });
    } else {
      return res.status(500).json({ error: 'Code is null' });
    }
  } catch (error) {
    handleError(error, res);
  }
});

const users: { [key: string]: string } = {}; // Replace with database in real app

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  users[username] = hashedPassword;
  res.status(201).json({ message: 'User registered' });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = users[username];
  if (hashedPassword && await bcrypt.compare(password, hashedPassword)) {
    const token = jwt.sign({ username }, 'secret-key');
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});


function handleError(error: unknown, res: express.Response) {
  if (isErrorObject(error)) {
    console.error(error.message);
    console.error(error.code);
    console.error(error.type);
    res.status(500).json({ error: error.message });
  } else {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

function isErrorObject(error: unknown): error is { message: string; code: string | null; type: string; param: string | null } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'type' in error
  );
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;