import { TreeSitterService } from '../../services/treeSitter';
import { AgentStatus, AgentType, Message, Task } from '../../types/agent';
import { MessageType } from '../../types/messages';
import { BaseAgent } from '../base/BaseAgent';

export class AnalyzerAgent extends BaseAgent {
    private treeSitter: TreeSitterService;
    private currentTask: Task | null = null;

    constructor(messageBus, stateManager, config = {}) {
        super(AgentType.ANALYZER, messageBus, stateManager, config);
        this.treeSitter = new TreeSitterService();
    }

    async initialize(): Promise<void> {
        await this.sendMessage({
            type: MessageType.AGENT_REGISTER,
            recipient: 'coordinator',
            payload: {
                agentId: this.id,
                agentType: this.type,
                capabilities: ['code.analyze']
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
            const result = await this.analyzeCode(task.parameters);
            
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
            if (error instanceof Error) {
                await this.handleTaskError(error);
            }
        }
    }

    private async analyzeCode(parameters: Record<string, any>): Promise<any> {
        const { filePath, context } = parameters;
        
        const analysis = {
            ast: await this.treeSitter.parseFile(filePath),
            metrics: await this.calculateMetrics(filePath),
            issues: await this.detectIssues(filePath),
            suggestions: await this.generateSuggestions(filePath)
        };

        return analysis;
    }

    private async calculateMetrics(filePath: string): Promise<any> {
        // Calculate code metrics like complexity, lines of code, etc.
        return {
            complexity: 0,
            linesOfCode: 0,
            functions: 0,
            classes: 0
        };
    }

    private async detectIssues(filePath: string): Promise<any> {
        // Detect code issues, anti-patterns, etc.
        return [];
    }

    private async generateSuggestions(filePath: string): Promise<any> {
        // Generate improvement suggestions
        return [];
    }

    private async handleTaskError(error: Error): Promise<void> {
        if (!this.currentTask) return;

        await this.sendMessage({
            type: MessageType.TASK_ERROR,
            recipient: 'coordinator',
            payload: {
                taskId: this.currentTask.id,
                error: error.message
            }
        });

        await this.updateState({
            status: AgentStatus.ERROR,
            currentTask: null
        });
    }

    async shutdown(): Promise<void> {
        await this.updateState({ status: AgentStatus.SHUTDOWN });
    }
} 