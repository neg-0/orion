import { AgentStatus, AgentType, Message, Task } from '../../types/agent';
import { MessageType } from '../../types/messages';
import { BaseAgent } from '../base/BaseAgent';

export class CoordinatorAgent extends BaseAgent {
    private registeredAgents: Map<string, AgentType>;
    private taskQueue: Task[];
    private activeTasksByAgent: Map<string, Task>;

    constructor(messageBus, stateManager, config = {}) {
        super(AgentType.COORDINATOR, messageBus, stateManager, config);
        this.registeredAgents = new Map();
        this.taskQueue = [];
        this.activeTasksByAgent = new Map();
    }

    async initialize(): Promise<void> {
        // Subscribe to relevant message types
        this.messageBus.subscribe('coordinator', this.handleMessage.bind(this));
        this.messageBus.subscribe('broadcast', this.handleBroadcast.bind(this));

        await this.updateState({ status: AgentStatus.IDLE });
        await this.sendMessage({
            type: MessageType.AGENT_READY,
            recipient: 'broadcast',
            payload: { agentId: this.id }
        });
    }

    async handleMessage(message: Message): Promise<void> {
        switch (message.type) {
            case MessageType.AGENT_REGISTER:
                await this.handleAgentRegistration(message);
                break;
            case MessageType.TASK_STATUS:
                await this.handleTaskStatusUpdate(message);
                break;
            case MessageType.TASK_COMPLETE:
                await this.handleTaskCompletion(message);
                break;
            case MessageType.TASK_ERROR:
                await this.handleTaskError(message);
                break;
        }
    }

    private async handleAgentRegistration(message: Message): Promise<void> {
        const { agentId, agentType } = message.payload;
        this.registeredAgents.set(agentId, agentType);
        
        // Acknowledge registration
        await this.sendMessage({
            type: MessageType.AGENT_READY,
            recipient: agentId,
            payload: { acknowledged: true }
        });

        // Check if there are pending tasks for this agent type
        await this.assignPendingTasks();
    }

    private async handleTaskStatusUpdate(message: Message): Promise<void> {
        const { taskId, status, progress } = message.payload;
        const task = this.activeTasksByAgent.get(message.sender);
        
        if (task && task.id === taskId) {
            task.status = status;
            task.progress = progress;
            await this.updateState({ currentTask: task });
        }
    }

    private async handleTaskCompletion(message: Message): Promise<void> {
        const { taskId, result } = message.payload;
        const task = this.activeTasksByAgent.get(message.sender);
        
        if (task && task.id === taskId) {
            task.status = 'completed';
            task.result = result;
            task.endTime = new Date();
            
            this.activeTasksByAgent.delete(message.sender);
            await this.assignPendingTasks();
        }
    }

    private async handleTaskError(message: Message): Promise<void> {
        const { taskId, error } = message.payload;
        const task = this.activeTasksByAgent.get(message.sender);
        
        if (task && task.id === taskId) {
            task.status = 'failed';
            task.error = error;
            task.endTime = new Date();
            
            this.activeTasksByAgent.delete(message.sender);
            await this.handleTaskFailure(task);
        }
    }

    private async assignPendingTasks(): Promise<void> {
        for (const task of this.taskQueue) {
            const availableAgent = this.findAvailableAgent(task.type);
            if (availableAgent) {
                await this.assignTask(task, availableAgent);
                this.taskQueue = this.taskQueue.filter(t => t.id !== task.id);
            }
        }
    }

    private findAvailableAgent(taskType: string): string | null {
        // Find an idle agent capable of handling this task type
        for (const [agentId, agentType] of this.registeredAgents) {
            if (!this.activeTasksByAgent.has(agentId) && this.canHandleTask(agentType, taskType)) {
                return agentId;
            }
        }
        return null;
    }

    private canHandleTask(agentType: AgentType, taskType: string): boolean {
        // Define which agent types can handle which task types
        const capabilities = {
            [AgentType.DEVELOPER]: ['code.generate', 'code.review'],
            [AgentType.ANALYZER]: ['code.analyze'],
            [AgentType.ARCHITECT]: ['architecture.review'],
            [AgentType.TESTER]: ['test.generate', 'test.execute']
        };
        
        return capabilities[agentType]?.includes(taskType) || false;
    }

    async shutdown(): Promise<void> {
        await this.updateState({ status: AgentStatus.SHUTDOWN });
        this.messageBus.unsubscribe('coordinator', this.handleMessage.bind(this));
        this.messageBus.unsubscribe('broadcast', this.handleBroadcast.bind(this));
    }
} 