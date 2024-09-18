import { exec } from 'child_process';
import cors from 'cors';
import 'dotenv/config'; // Ensure this is at the very top
import express from 'express';
import fs from 'fs';
import morgan from './middleware/morgan';
import treesitter from './middleware/treeSitter';
import routes from './routes';
import openai from './services/openai.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(morgan);
app.use(express.json());
app.use(cors());

const router = express.Router();

app.use('/', routes);

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

// Test the tree-sitter code
treesitter();

export default app;