// This experiement is to see if we can modify a code file using a text prompt and ChatGPT.
// The inputs are the file content and the prompt, and the output is the modified file content.
// The file will be completely overwritten with the new content.

import fs from 'fs';
import OpenAI from 'openai';

const filePath = `/home/neg-0/src/orion/workspace/orion-test/src/App.jsx`;


const systemPrompt = `
You are an expert software engineer and you are tasked with improving the code quality of the following file.
Output the modified code after making the necessary changes.
Do not modify any other part of the file except the exact changes needed to implement the prompt.
Output the entire code file with the modification. Do not include any other information or explainations.`;

const issueTicketPrompt = `BUG: The counter button is not working as expected. It should increment the count by 1 on each click.`;


// Call the OpenAI API to generate the modified file content
const openai = new OpenAI({
  apiKey: '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',
});

async function main() {
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  const prompt = `SYSTEM PROMPT:${systemPrompt}\n\nISSUE TICKET:${issueTicketPrompt}\n\nBEGIN FILE CONTENT:${fileContent}\n\nEND FILE CONTENT`;

  const completion = await openai.chat.completions.create({
    messages: [{ role: 'system', content: prompt }],
    model: 'gpt-3.5-turbo',
  });

  const modifiedFileContent = completion.choices[0].message?.content;

  console.log(modifiedFileContent);
}

main();