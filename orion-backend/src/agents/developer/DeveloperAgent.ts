import { MessageBus } from '../../core/messaging/MessageBus';
import { StateManager } from '../../core/state/StateManager';
import { OpenAIService } from '../../services/openai';
import { AgentConfig, AgentStatus, AgentType, Message, Task } from '../../types/agent';
import { MessageType } from '../../types/messages';
import {
    CodeAnalysisRequest,
    CodeGenerationRequest
} from '../../types/services';
import { BaseAgent } from '../base/BaseAgent';

export class DeveloperAgent extends BaseAgent {
    private openai: OpenAIService;
    private currentTask: Task | null = null;

    constructor(
        messageBus: MessageBus,
        stateManager: StateManager,
        config: AgentConfig = {}
    ) {
        super(AgentType.DEVELOPER, messageBus, stateManager, config);
        this.openai = new OpenAIService();
    }

    async initialize(): Promise<void> {
        // Register capabilities
        await this.sendMessage({
            type: MessageType.AGENT_REGISTER,
            recipient: 'coordinator',
            payload: {
                agentId: this.id,
                agentType: this.type,
                capabilities: ['code.generate', 'code.review']
            }
        });

        await this.updateState({ status: AgentStatus.IDLE });
    }

    async handleMessage(message: Message): Promise<void> {
        switch (message.type) {
            case MessageType.TASK_ASSIGNMENT:
                await this.handleTaskAssignment(message);
                break;
        }
    }

    private async handleTaskAssignment(message: Message): Promise<void> {
        const task = message.payload as Task;
        this.currentTask = task;
        
        await this.updateState({
            status: AgentStatus.WORKING,
            currentTask: task
        });

        try {
            let result;
            switch (task.type) {
                case 'code.generate':
                    result = await this.generateCode(task.parameters);
                    break;
                case 'code.review':
                    result = await this.reviewCode(task.parameters);
                    break;
            }

            await this.sendMessage({
                type: MessageType.TASK_COMPLETE,
                recipient: 'coordinator',
                payload: {
                    taskId: task.id,
                    result
                }
            });

            this.currentTask = null;
            await this.updateState({
                status: AgentStatus.IDLE,
                currentTask: null
            });

        } catch (error) {
            await this.handleTaskError(error);
        }
    }

    private async generateCode(parameters: Record<string, any>): Promise<any> {
        const request: CodeGenerationRequest = {
            prompt: parameters.prompt,
            context: {
                projectStructure: parameters.projectStructure,
                dependencies: parameters.dependencies,
                existingCode: parameters.existingCode,
                requirements: parameters.requirements
            },
            constraints: {
                language: parameters.language || 'typescript',
                framework: parameters.framework,
                style: parameters.style,
                maxTokens: parameters.maxTokens
            }
        };

        try {
            const result = await this.openai.generateCode(request);
            
            // Log the generation for learning
            await this.logCodeGeneration(request, result);
            
            return result;
        } catch (error) {
            throw new Error(`Code generation failed: ${error}`);
        }
    }

    private async reviewCode(parameters: Record<string, any>): Promise<any> {
        const request: CodeAnalysisRequest = {
            code: parameters.code,
            language: parameters.language || 'typescript',
            context: parameters.context,
            focus: parameters.focus || ['security', 'performance', 'architecture', 'style']
        };

        try {
            const result = await this.openai.analyzeCode(request);
            
            // Log the analysis for learning
            await this.logCodeAnalysis(request, result);
            
            return result;
        } catch (error) {
            throw new Error(`Code analysis failed: ${error}`);
        }
    }

    private async logCodeGeneration(request: CodeGenerationRequest, result: any): Promise<void> {
        // Store successful generations for learning
        await this.sendMessage({
            type: MessageType.STATE_UPDATE,
            recipient: 'coordinator',
            payload: {
                type: 'learning',
                category: 'code-generation',
                request,
                result
            }
        });
    }

    private async logCodeAnalysis(request: CodeAnalysisRequest, result: any): Promise<void> {
        // Store successful analyses for learning
        await this.sendMessage({
            type: MessageType.STATE_UPDATE,
            recipient: 'coordinator',
            payload: {
                type: 'learning',
                category: 'code-analysis',
                request,
                result
            }
        });
    }

    private async handleTaskError(error: unknown): Promise<void> {
        if (!this.currentTask) return;

        const errorMessage = error instanceof Error ? error.message : String(error);
        
        await this.sendMessage({
            type: MessageType.TASK_ERROR,
            recipient: 'coordinator',
            payload: {
                taskId: this.currentTask.id,
                error: errorMessage
            }
        });

        await this.updateState({
            status: AgentStatus.ERROR,
            currentTask: null,
            lastError: errorMessage
        });
    }

    async shutdown(): Promise<void> {
        await this.updateState({ status: AgentStatus.SHUTDOWN });
    }
} 