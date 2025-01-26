import fs from 'fs/promises';
import path from 'path';
import { AgentState } from '../../../types/agent';
import { StateUpdate } from '../StateManager';
import { StateStore, StateStoreOptions } from './StateStore';

interface StorageData {
    states: Record<string, AgentState>;
    history: StateUpdate[];
    version: number;
}

export class FileStateStore implements StateStore {
    private states: Map<string, AgentState>;
    private history: StateUpdate[];
    private readonly filePath: string;
    private readonly historyLimit: number;
    private readonly autoSaveInterval: number;
    private autoSaveTimer?: NodeJS.Timer;
    private initialized = false;

    constructor(
        storageDir: string,
        options: StateStoreOptions = {}
    ) {
        this.states = new Map();
        this.history = [];
        this.filePath = path.join(storageDir, 'state-store.json');
        this.historyLimit = options.historyLimit || 1000;
        this.autoSaveInterval = options.autoSaveInterval || 5000; // 5 seconds
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            await fs.mkdir(path.dirname(this.filePath), { recursive: true });
            const data = await this.loadFromDisk();
            if (data) {
                this.states = new Map(Object.entries(data.states));
                this.history = data.history;
            }
            this.startAutoSave();
            this.initialized = true;
        } catch (error) {
            throw new Error(`Failed to initialize state store: ${error.message}`);
        }
    }

    async shutdown(): Promise<void> {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        await this.saveToDisk();
    }

    async saveState(agentId: string, state: AgentState): Promise<void> {
        this.ensureInitialized();
        this.states.set(agentId, state);
        await this.saveToDisk();
    }

    async getState(agentId: string): Promise<AgentState | null> {
        this.ensureInitialized();
        return this.states.get(agentId) || null;
    }

    async getAllStates(): Promise<Map<string, AgentState>> {
        this.ensureInitialized();
        return new Map(this.states);
    }

    async saveStateUpdate(update: StateUpdate): Promise<void> {
        this.ensureInitialized();
        this.history.unshift(update);
        if (this.history.length > this.historyLimit) {
            this.history.pop();
        }
        await this.saveToDisk();
    }

    async getStateHistory(agentId: string, limit?: number): Promise<StateUpdate[]> {
        this.ensureInitialized();
        const agentHistory = this.history.filter(update => update.agentId === agentId);
        return limit ? agentHistory.slice(0, limit) : agentHistory;
    }

    async clear(): Promise<void> {
        this.ensureInitialized();
        this.states.clear();
        this.history = [];
        await this.saveToDisk();
    }

    private async loadFromDisk(): Promise<StorageData | null> {
        try {
            const content = await fs.readFile(this.filePath, 'utf-8');
            const data = JSON.parse(content) as StorageData;
            
            // Convert date strings back to Date objects
            for (const state of Object.values(data.states)) {
                state.lastUpdate = new Date(state.lastUpdate);
                if (state.currentTask) {
                    if (state.currentTask.startTime) {
                        state.currentTask.startTime = new Date(state.currentTask.startTime);
                    }
                    if (state.currentTask.endTime) {
                        state.currentTask.endTime = new Date(state.currentTask.endTime);
                    }
                }
            }

            return data;
        } catch (error) {
            if (error.code === 'ENOENT') {
                return null;
            }
            throw error;
        }
    }

    private async saveToDisk(): Promise<void> {
        const data: StorageData = {
            states: Object.fromEntries(this.states),
            history: this.history,
            version: 1
        };
        await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    }

    private startAutoSave(): void {
        if (this.autoSaveInterval > 0) {
            this.autoSaveTimer = setInterval(() => {
                this.saveToDisk().catch(error => {
                    console.error('Auto-save failed:', error);
                });
            }, this.autoSaveInterval);

            // Don't prevent Node from exiting
            this.autoSaveTimer.unref();
        }
    }

    private ensureInitialized(): void {
        if (!this.initialized) {
            throw new Error('StateStore is not initialized. Call initialize() first.');
        }
    }
} 