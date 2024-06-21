var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
app.post('/api/ai-response', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { prompt } = req.body;
    try {
        const chatCompletion = yield openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-3.5-turbo',
        });
        res.json({ result: (_a = chatCompletion.choices[0].message) === null || _a === void 0 ? void 0 : _a.content });
    }
    catch (error) {
        handleError(error, res);
    }
}));
app.post('/api/generate-code', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { prompt } = req.body;
    try {
        const completion = yield openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-3.5-turbo',
        });
        const code = (_b = completion.choices[0].message) === null || _b === void 0 ? void 0 : _b.content;
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
        }
        else {
            return res.status(500).json({ error: 'Code is null' });
        }
    }
    catch (error) {
        handleError(error, res);
    }
}));
const users = {}; // Replace with database in real app
app.post('/api/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const hashedPassword = yield bcrypt.hash(password, 10);
    users[username] = hashedPassword;
    res.status(201).json({ message: 'User registered' });
}));
app.post('/api/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const hashedPassword = users[username];
    if (hashedPassword && (yield bcrypt.compare(password, hashedPassword))) {
        const token = jwt.sign({ username }, 'secret-key');
        res.json({ token });
    }
    else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
}));
function handleError(error, res) {
    if (isErrorObject(error)) {
        console.error(error.message);
        console.error(error.code);
        console.error(error.type);
        res.status(500).json({ error: error.message });
    }
    else {
        console.error(error);
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
}
function isErrorObject(error) {
    return (typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        'type' in error);
}
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
export default app;
