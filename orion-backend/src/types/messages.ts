export enum MessageType {
    // System Messages
    STATE_UPDATE = 'STATE_UPDATE',
    AGENT_REGISTER = 'AGENT_REGISTER',
    AGENT_READY = 'AGENT_READY',
    AGENT_ERROR = 'AGENT_ERROR',
    AGENT_SHUTDOWN = 'AGENT_SHUTDOWN',

    // Task Messages
    TASK_ASSIGNMENT = 'TASK_ASSIGNMENT',
    TASK_STATUS = 'TASK_STATUS',
    TASK_COMPLETE = 'TASK_COMPLETE',
    TASK_ERROR = 'TASK_ERROR',
    TASK_CANCELLED = 'TASK_CANCELLED',

    // Work Messages
    CODE_ANALYSIS = 'CODE_ANALYSIS',
    CODE_GENERATION = 'CODE_GENERATION',
    CODE_REVIEW = 'CODE_REVIEW',
    ARCHITECTURE_REVIEW = 'ARCHITECTURE_REVIEW',
    TEST_GENERATION = 'TEST_GENERATION',
    TEST_EXECUTION = 'TEST_EXECUTION',
    DEPLOYMENT = 'DEPLOYMENT',
    MONITORING = 'MONITORING'
}

export interface Message {
    type: MessageType;
    sender: string;
    recipient: string;
    payload: Record<string, any>;
    id?: string;
    timestamp?: number;
    correlationId?: string;
}

export interface MessageDeliveryResult {
    delivered: boolean;
    recipients: string[];
    error?: Error;
    timestamp: number;
}

export interface MessageSubscription {
    id: string;
    recipient: string;
    callback: MessageCallback;
}

export type MessageCallback = (message: Message) => void | Promise<void>;

export interface MessageBusEvents {
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: 'delivered', listener: (result: MessageDeliveryResult) => void): this;
    on(event: 'subscribed', listener: (subscription: MessageSubscription) => void): this;
    on(event: 'unsubscribed', listener: (subscriptionId: string) => void): this;
}

export interface TaskMessage {
    taskId: string;
    type: string;
    parameters: Record<string, any>;
    priority?: number;
    deadline?: Date;
} 