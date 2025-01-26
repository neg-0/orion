import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import {
    CodeAnalysisRequest,
    CodeAnalysisResponse,
    CodeGenerationRequest,
    CodeGenerationResponse,
    TestGenerationRequest,
    TestGenerationResponse
} from '../types/services';

export class OpenAIService {
    private client: OpenAI;
    private defaultModel = 'gpt-4';
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAY = 1000; // 1 second

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is not defined');
        }
        this.client = new OpenAI({ apiKey });
    }

    async analyzeCode(request: CodeAnalysisRequest): Promise<CodeAnalysisResponse> {
        const focusAreas = request.focus?.join(', ') || 'general';
        const messages: ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: `You are an expert software engineer analyzing code with focus on ${focusAreas}. 
                         Provide detailed analysis with specific line numbers and concrete suggestions for improvement.`
            },
            {
                role: 'user',
                content: `
                Language: ${request.language}
                Context: ${request.context || 'No context provided'}
                
                Code to analyze:
                \`\`\`${request.language}
                ${request.code}
                \`\`\`
                
                Provide analysis focusing on:
                ${request.focus?.map(f => `- ${f}`).join('\n') || 'general code quality'}
                `
            }
        ];

        const completion = await this.generateStructuredCompletion<CodeAnalysisResponse>(
            messages,
            {
                temperature: 0.3,
                response_format: { type: "json_object" }
            }
        );

        return completion;
    }

    async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
        return this.withRetry(async () => {
            const messages = this.buildCodeGenerationMessages(request);
            return this.generateStructuredCompletion<CodeGenerationResponse>(
                messages,
                {
                    temperature: 0.2,
                    max_tokens: request.constraints?.maxTokens,
                    response_format: { type: "json_object" }
                }
            );
        });
    }

    async generateTests(request: TestGenerationRequest): Promise<TestGenerationResponse> {
        const messages: ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: `You are an expert in writing ${request.type} tests${request.framework ? ` using ${request.framework}` : ''}.
                         Generate comprehensive tests with high coverage and proper mocking.`
            },
            {
                role: 'user',
                content: `
                Generate ${request.type} tests for:
                \`\`\`
                ${request.code}
                \`\`\`
                
                Coverage Requirements:
                ${request.coverage ? JSON.stringify(request.coverage, null, 2) : 'Standard coverage'}
                `
            }
        ];

        const completion = await this.generateStructuredCompletion<TestGenerationResponse>(
            messages,
            {
                temperature: 0.2,
                response_format: { type: "json_object" }
            }
        );

        return completion;
    }

    private async generateStructuredCompletion<T>(
        messages: ChatCompletionMessageParam[],
        options: {
            temperature?: number;
            max_tokens?: number;
            response_format?: { type: "json_object" };
        } = {}
    ): Promise<T> {
        const completion = await this.client.chat.completions.create({
            model: this.defaultModel,
            messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.max_tokens,
            response_format: options.response_format
        });

        const content = completion.choices[0].message?.content;
        if (!content) {
            throw new Error('No content in response');
        }

        try {
            return JSON.parse(content) as T;
        } catch (error) {
            throw new Error(`Failed to parse response: ${error}`);
        }
    }

    private async withRetry<T>(
        operation: () => Promise<T>,
        retries = this.MAX_RETRIES
    ): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            if (retries > 0 && this.isRetryableError(error)) {
                await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
                return this.withRetry(operation, retries - 1);
            }
            throw this.enhanceError(error);
        }
    }

    private isRetryableError(error: unknown): boolean {
        if (error instanceof Error) {
            // Retry on rate limits or temporary OpenAI issues
            return error.message.includes('rate_limit') ||
                   error.message.includes('server_error') ||
                   error.message.includes('timeout');
        }
        return false;
    }

    private enhanceError(error: unknown): Error {
        if (error instanceof Error) {
            return new Error(`OpenAI Service Error: ${error.message}`, { cause: error });
        }
        return new Error(`OpenAI Service Error: ${String(error)}`);
    }

    private buildCodeGenerationMessages(request: CodeGenerationRequest): ChatCompletionMessageParam[] {
        return [
            {
                role: 'system',
                content: this.buildSystemPrompt(request)
            },
            {
                role: 'user',
                content: this.buildUserPrompt(request)
            }
        ];
    }

    private buildSystemPrompt(request: CodeGenerationRequest): string {
        return `You are an expert software engineer generating high-quality ${request.constraints?.language || ''} code.
                Follow these principles:
                - Write clean, maintainable code
                - Include proper error handling
                - Follow ${request.constraints?.style || 'standard'} style guidelines
                - Add comprehensive documentation
                - Consider edge cases and validation
                ${request.constraints?.framework ? `- Use ${request.constraints.framework} best practices` : ''}`;
    }

    private buildUserPrompt(request: CodeGenerationRequest): string {
        const contextParts = [];
        if (request.context?.projectStructure) {
            contextParts.push(`Project Structure:\n${request.context.projectStructure}`);
        }
        if (request.context?.dependencies) {
            contextParts.push(`Dependencies:\n${JSON.stringify(request.context.dependencies, null, 2)}`);
        }
        if (request.context?.existingCode) {
            contextParts.push(`Existing Code:\n${request.context.existingCode}`);
        }
        if (request.context?.requirements?.length) {
            contextParts.push(`Requirements:\n${request.context.requirements.join('\n')}`);
        }

        return `
            Task Requirements:
            ${request.prompt}

            ${contextParts.length ? 'Context:\n' + contextParts.join('\n\n') : ''}
            
            Constraints:
            - Language: ${request.constraints?.language || 'Not specified'}
            ${request.constraints?.framework ? `- Framework: ${request.constraints.framework}` : ''}
            ${request.constraints?.style ? `- Style: ${request.constraints.style}` : ''}
        `;
    }
}
