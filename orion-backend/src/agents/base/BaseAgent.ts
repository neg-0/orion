import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { MessageBus } from '../../core/messaging/MessageBus';
import { StateManager } from '../../core/state/StateManager';
import { AgentState, AgentStatus, AgentType, Message } from '../../types/agent';
import { AgentConfig } from '../../types/config';

export abstract class BaseAgent extends EventEmitter {
    readonly id: string;
    protected state: AgentState;
    protected config: AgentConfig;
    
    constructor(
        public readonly type: AgentType,
        protected messageBus: MessageBus,
        protected stateManager: StateManager,
        config: Partial<AgentConfig> = {}
    ) {
        super();
        this.id = uuidv4();
        this.state = {
            status: AgentStatus.INITIALIZING,
            currentTask: null,
            metrics: {},
            lastUpdate: new Date()
        };
        this.config = this.getDefaultConfig(type);
        Object.assign(this.config, config);
    }

    abstract initialize(): Promise<void>;
    abstract handleMessage(message: Message): Promise<void>;
    abstract shutdown(): Promise<void>;

    protected async updateState(update: Partial<AgentState>): Promise<void> {
        this.state = {
            ...this.state,
            ...update,
            lastUpdate: new Date()
        };
        await this.stateManager.updateState(this.id, this.state);
        this.emit('stateChanged', this.state);
    }

    protected async sendMessage(message: Partial<Message>): Promise<void> {
        const fullMessage: Message = {
            id: uuidv4(),
            timestamp: new Date(),
            sender: this.id,
            type: message.type!,
            payload: message.payload!,
            recipient: message.recipient!,
            metadata: {
                ...message.metadata,
                agentType: this.type,
                correlationId: message.metadata?.correlationId || uuidv4()
            }
        };
        await this.messageBus.publish(fullMessage);
    }

    private getDefaultConfig(type: AgentType): AgentConfig {
        return {
            capabilities: [],
            resources: {
                memory: 512,
                cpu: 1,
                network: {
                    requestsPerSecond: 10,
                    bandwidth: 1024
                }
            },
            security: {
                permissions: [],
                apiKeys: {},
                restrictions: []
            }
        };
    }
} 