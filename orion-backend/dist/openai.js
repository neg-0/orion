import OpenAI from 'openai';
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not defined');
}
const openai = new OpenAI({
    apiKey, // This ensures apiKey is always a string
});
export default openai;
