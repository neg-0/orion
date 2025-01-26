export enum TaskStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED'
}

export enum TaskType {
    CODE_ANALYSIS = 'CODE_ANALYSIS',
    CODE_GENERATION = 'CODE_GENERATION',
    CODE_REVIEW = 'CODE_REVIEW',
    ARCHITECTURE_REVIEW = 'ARCHITECTURE_REVIEW',
    TEST_GENERATION = 'TEST_GENERATION',
    TEST_EXECUTION = 'TEST_EXECUTION',
    DEPLOYMENT = 'DEPLOYMENT',
    MONITORING = 'MONITORING'
}

export interface Task {
    id: string;
    type: TaskType;
    status: TaskStatus;
    priority: number;
    progress: number;
    parameters: Record<string, any>;
    result?: any;
    error?: string;
    startTime?: Date;
    endTime?: Date;
    assignedTo?: string;
    createdBy: string;
    dependencies?: string[];
    metadata: Record<string, any>;
} 