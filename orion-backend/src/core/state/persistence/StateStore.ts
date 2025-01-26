import { AgentState } from '../../../types/agent';
import { StateUpdate } from '../StateManager';

export interface StateStoreOptions {
    historyLimit?: number;
    autoSaveInterval?: number;
}

export interface StateStore {
    /**
     * Save the current state of an agent
     * @param agentId The ID of the agent
     * @param state The state to save
     */
    saveState(agentId: string, state: AgentState): Promise<void>;

    /**
     * Get the current state of an agent
     * @param agentId The ID of the agent
     */
    getState(agentId: string): Promise<AgentState | null>;

    /**
     * Get all current agent states
     */
    getAllStates(): Promise<Map<string, AgentState>>;

    /**
     * Save a state update to history
     * @param update The state update to save
     */
    saveStateUpdate(update: StateUpdate): Promise<void>;

    /**
     * Get state history for an agent
     * @param agentId The ID of the agent
     * @param limit Maximum number of history entries to return
     */
    getStateHistory(agentId: string, limit?: number): Promise<StateUpdate[]>;

    /**
     * Clear all state data
     */
    clear(): Promise<void>;

    /**
     * Initialize the store
     */
    initialize(): Promise<void>;

    /**
     * Clean up resources
     */
    shutdown(): Promise<void>;
} 