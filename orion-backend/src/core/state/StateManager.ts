import { EventEmitter } from 'events';
import { AgentState, AgentStatus, AgentType } from '../../types/agent';
import { MessageType } from '../../types/messages';
import { MessageBus } from '../messaging/MessageBus';
import { StateStore } from './persistence/StateStore';

export interface StateUpdate {
    agentId: string;
    state: Partial<AgentState>;
    timestamp: number;
}

export interface StateQuery {
    agentId?: string;
    status?: AgentStatus;
    timestamp?: {
        before?: number;
        after?: number;
    };
}

export interface StateManagerOptions {
    historyLimit?: number;
    autoSaveInterval?: number;
}

export class StateManager extends EventEmitter {
    private states: Map<string, AgentState>;
    private stateHistory: StateUpdate[];
    private readonly historyLimit: number;
    private initialized = false;
    
    constructor(
        private readonly messageBus: MessageBus,
        private readonly store: StateStore,
        options: StateManagerOptions = {}
    ) {
        super();
        this.states = new Map();
        this.stateHistory = [];
        this.historyLimit = options.historyLimit || 1000;

        // Handle any unhandled errors
        this.on('error', () => {
            // Prevent Node from crashing on unhandled error events
        });
    }

    /**
     * Initialize the state manager and load persisted state
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;

        await this.store.initialize();
        this.states = await this.store.getAllStates();
        const history = await this.store.getStateHistory('', this.historyLimit);
        this.stateHistory = history;
        this.initialized = true;
    }

    /**
     * Shutdown the state manager and persist final state
     */
    async shutdown(): Promise<void> {
        if (!this.initialized) return;

        await this.store.shutdown();
        this.initialized = false;
        this.removeAllListeners();
    }

    /**
     * Update the state of an agent
     * @param agentId The ID of the agent to update
     * @param update Partial state update to apply
     * @returns The updated state
     */
    async updateState(agentId: string, update: Partial<AgentState>): Promise<AgentState> {
        this.ensureInitialized();
        const now = new Date();
        const currentState = this.states.get(agentId) || {
            id: agentId,
            type: AgentType.DEVELOPER, // Default type, should be provided in update
            status: AgentStatus.INITIALIZING,
            tasks: [],
            capabilities: [],
            metrics: {},
            lastUpdate: now
        };

        const newState: AgentState = {
            ...currentState,
            ...update,
            lastUpdate: update.lastUpdate || now
        };

        this.states.set(agentId, newState);
        await this.store.saveState(agentId, newState);

        const stateUpdate: StateUpdate = {
            agentId,
            state: update,
            timestamp: now.getTime()
        };

        // Add to history and maintain order
        this.stateHistory.unshift(stateUpdate);
        if (this.stateHistory.length > this.historyLimit) {
            this.stateHistory.pop();
        }
        await this.store.saveStateUpdate(stateUpdate);

        // Broadcast state update
        await this.messageBus.publish({
            type: MessageType.STATE_UPDATE,
            sender: 'state-manager',
            recipient: 'broadcast',
            payload: stateUpdate,
            timestamp: now.getTime()
        });

        this.emit('stateUpdated', stateUpdate);
        return newState;
    }

    /**
     * Get the current state of an agent
     * @param agentId The ID of the agent
     * @returns The current state or null if not found
     */
    async getState(agentId: string): Promise<AgentState | null> {
        this.ensureInitialized();
        return this.store.getState(agentId);
    }

    /**
     * Get all current agent states
     * @returns Map of agent IDs to their current states
     */
    async getAllStates(): Promise<Map<string, AgentState>> {
        this.ensureInitialized();
        return this.store.getAllStates();
    }

    /**
     * Query states based on criteria
     * @param query Query parameters
     * @returns Array of matching states
     */
    async queryStates(query: StateQuery): Promise<AgentState[]> {
        this.ensureInitialized();
        const states = await this.getAllStates();
        let results = Array.from(states.values());

        if (query.agentId) {
            results = results.filter(state => state.id === query.agentId);
        }

        if (query.status) {
            results = results.filter(state => state.status === query.status);
        }

        if (query.timestamp) {
            if (query.timestamp.after) {
                results = results.filter(state => state.lastUpdate.getTime() >= query.timestamp!.after!);
            }
            if (query.timestamp.before) {
                results = results.filter(state => state.lastUpdate.getTime() <= query.timestamp!.before!);
            }
        }

        return results;
    }

    /**
     * Get state history for an agent
     * @param agentId The ID of the agent
     * @param limit Maximum number of history entries to return
     * @returns Array of state updates
     */
    async getStateHistory(agentId: string, limit?: number): Promise<StateUpdate[]> {
        this.ensureInitialized();
        return this.store.getStateHistory(agentId, limit);
    }

    /**
     * Clear all state data
     */
    async clear(): Promise<void> {
        this.ensureInitialized();
        this.states.clear();
        this.stateHistory = [];
        await this.store.clear();
        this.emit('stateCleared');
    }

    /**
     * Register event handlers for state updates
     * @param handler Callback function for state updates
     * @returns Function to unregister the handler
     */
    onStateUpdate(handler: (update: StateUpdate) => void): () => void {
        this.on('stateUpdated', handler);
        return () => this.off('stateUpdated', handler);
    }

    private ensureInitialized(): void {
        if (!this.initialized) {
            throw new Error('StateManager is not initialized. Call initialize() first.');
        }
    }
} 