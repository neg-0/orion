import { Task } from './task';

export enum AgentStatus {
    INITIALIZING = 'INITIALIZING',
    READY = 'READY',
    BUSY = 'BUSY',
    ERROR = 'ERROR',
    SHUTDOWN = 'SHUTDOWN'
}

export enum AgentType {
    COORDINATOR = 'COORDINATOR',
    DEVELOPER = 'DEVELOPER',
    ANALYZER = 'ANALYZER',
    ARCHITECT = 'ARCHITECT',
    TESTER = 'TESTER',
    DEVOPS = 'DEVOPS'
}

export interface AgentState {
    id: string;
    type: AgentType;
    status: AgentStatus;
    tasks: Task[];
    currentTask?: Task | null;
    capabilities: string[];
    metrics: Record<string, any>;
    lastUpdate: Date;
    lastError?: string;
}

export interface Message {
    type: string;
    sender: string;
    recipient: string;
    payload: Record<string, any>;
    metadata: Record<string, any>;
    id?: string;
    timestamp?: number;
    correlationId?: string;
} 