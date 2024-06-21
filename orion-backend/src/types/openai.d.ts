// declare module 'openai' {
//   interface ErrorObject {
//     code: string | null;
//     message: string;
//     param: string | null;
//     type: string;
//   }

//   interface CompletionResult {
//     choices: { text: string }[];
//   }

//   class OpenAI {
//     constructor(config: { apiKey: string });

//     completions: {
//       create: (params: {
//         model: string;
//         prompt: string;
//         max_tokens: number;
//       }) => Promise<CompletionResult>;
//     };
//   }

//   export default OpenAI;
// }
