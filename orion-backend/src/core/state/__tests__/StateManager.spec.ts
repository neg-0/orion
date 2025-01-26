/// <reference types="jest" />

import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { AgentStatus, AgentType } from '../../../types/agent';
import { MessageType } from '../../../types/messages';
import { MessageBus } from '../../messaging/MessageBus';
import { StateManager, StateUpdate } from '../StateManager';
import { FileStateStore } from '../persistence/FileStateStore';

describe('StateManager', () => {
    let stateManager: StateManager;
    let messageBus: MessageBus;
    let stateStore: FileStateStore;
    let tempDir: string;

    beforeEach(async () => {
        messageBus = new MessageBus();
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'state-manager-test-'));
        stateStore = new FileStateStore(tempDir, { autoSaveInterval: 0 });
        stateManager = new StateManager(messageBus, stateStore);
        await stateManager.initialize();
    });

    afterEach(async () => {
        await stateManager.shutdown();
        messageBus.shutdown();
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    describe('State Updates', () => {
        it('should create initial state for new agents', async () => {
            const agentId = 'test-agent';
            const update = { 
                status: AgentStatus.READY,
                type: AgentType.DEVELOPER
            };

            const newState = await stateManager.updateState(agentId, update);

            expect(newState).toMatchObject({
                id: agentId,
                type: AgentType.DEVELOPER,
                status: AgentStatus.READY,
                tasks: [],
                capabilities: []
            });
            expect(newState.lastUpdate).toBeInstanceOf(Date);

            // Verify persistence
            const persistedState = await stateStore.getState(agentId);
            expect(persistedState).toEqual(newState);
        });

        it('should update existing agent state', async () => {
            const agentId = 'test-agent';
            await stateManager.updateState(agentId, { 
                status: AgentStatus.READY,
                type: AgentType.DEVELOPER
            });
            
            const update = { status: AgentStatus.BUSY };
            const updatedState = await stateManager.updateState(agentId, update);

            expect(updatedState.status).toBe(AgentStatus.BUSY);
            expect(updatedState.lastUpdate).toBeInstanceOf(Date);

            // Verify persistence
            const persistedState = await stateStore.getState(agentId);
            expect(persistedState).toEqual(updatedState);
        });

        it('should broadcast state updates via message bus', async () => {
            const messageSent = new Promise<void>((resolve) => {
                messageBus.subscribe('broadcast', (message) => {
                    expect(message.type).toBe(MessageType.STATE_UPDATE);
                    expect(message.payload.agentId).toBe('test-agent');
                    expect(message.payload.state.status).toBe(AgentStatus.READY);
                    resolve();
                });
            });

            await stateManager.updateState('test-agent', { 
                status: AgentStatus.READY,
                type: AgentType.DEVELOPER
            });
            await messageSent;
        });

        it('should emit stateUpdated event', (done) => {
            const agentId = 'test-agent';
            const update = { 
                status: AgentStatus.READY,
                type: AgentType.DEVELOPER
            };

            stateManager.onStateUpdate((stateUpdate: StateUpdate) => {
                expect(stateUpdate.agentId).toBe(agentId);
                expect(stateUpdate.state).toMatchObject(update);
                expect(typeof stateUpdate.timestamp).toBe('number');
                done();
            });

            stateManager.updateState(agentId, update).catch(done);
        });
    });

    describe('State Queries', () => {
        it('should retrieve current state for an agent', async () => {
            const agentId = 'test-agent';
            const initialState = await stateManager.updateState(agentId, { 
                status: AgentStatus.READY,
                type: AgentType.DEVELOPER
            });

            const retrievedState = await stateManager.getState(agentId);
            expect(retrievedState).toEqual(initialState);
        });

        it('should return null for unknown agent states', async () => {
            const state = await stateManager.getState('unknown-agent');
            expect(state).toBeNull();
        });

        it('should get all current states', async () => {
            await stateManager.updateState('agent1', { 
                status: AgentStatus.READY,
                type: AgentType.DEVELOPER
            });
            await stateManager.updateState('agent2', { 
                status: AgentStatus.BUSY,
                type: AgentType.ANALYZER
            });

            const allStates = await stateManager.getAllStates();
            expect(allStates.size).toBe(2);
            expect(Array.from(allStates.keys())).toEqual(['agent1', 'agent2']);
        });

        it('should query states by status', async () => {
            await stateManager.updateState('agent1', { 
                status: AgentStatus.READY,
                type: AgentType.DEVELOPER
            });
            await stateManager.updateState('agent2', { 
                status: AgentStatus.BUSY,
                type: AgentType.ANALYZER
            });
            await stateManager.updateState('agent3', { 
                status: AgentStatus.READY,
                type: AgentType.TESTER
            });

            const readyAgents = await stateManager.queryStates({ status: AgentStatus.READY });
            expect(readyAgents).toHaveLength(2);
            expect(readyAgents.every(state => state.status === AgentStatus.READY)).toBe(true);
        });

        it('should query states by timestamp range', async () => {
            const now = new Date();
            const hourAgo = new Date(now.getTime() - 3600000);

            await stateManager.updateState('agent1', { 
                status: AgentStatus.READY,
                type: AgentType.DEVELOPER,
                lastUpdate: hourAgo
            });
            await stateManager.updateState('agent2', { 
                status: AgentStatus.READY,
                type: AgentType.ANALYZER,
                lastUpdate: now
            });

            const recentStates = await stateManager.queryStates({
                timestamp: {
                    after: now.getTime() - 1800000 // 30 minutes ago
                }
            });

            expect(recentStates).toHaveLength(1);
            expect(recentStates[0].id).toBe('agent2');
        });
    });

    describe('State History', () => {
        it('should maintain state update history', async () => {
            const agentId = 'test-agent';
            
            await stateManager.updateState(agentId, { 
                status: AgentStatus.INITIALIZING,
                type: AgentType.DEVELOPER
            });
            await stateManager.updateState(agentId, { 
                status: AgentStatus.READY
            });
            await stateManager.updateState(agentId, { 
                status: AgentStatus.BUSY
            });

            const history = await stateManager.getStateHistory(agentId);
            expect(history).toHaveLength(3);
            expect(history[0].state.status).toBe(AgentStatus.BUSY);
            expect(history[2].state.status).toBe(AgentStatus.INITIALIZING);

            // Verify persistence
            const persistedHistory = await stateStore.getStateHistory(agentId);
            expect(persistedHistory).toEqual(history);
        });

        it('should respect history limit', async () => {
            const stateManager = new StateManager(messageBus, stateStore, { historyLimit: 2 });
            await stateManager.initialize();
            const agentId = 'test-agent';

            await stateManager.updateState(agentId, { 
                status: AgentStatus.INITIALIZING,
                type: AgentType.DEVELOPER
            });
            await stateManager.updateState(agentId, { 
                status: AgentStatus.READY
            });
            await stateManager.updateState(agentId, { 
                status: AgentStatus.BUSY
            });

            const history = await stateManager.getStateHistory(agentId);
            expect(history).toHaveLength(2);
            expect(history[0].state.status).toBe(AgentStatus.BUSY);
            expect(history[1].state.status).toBe(AgentStatus.READY);
        });

        it('should clear state history on clear()', async () => {
            const agentId = 'test-agent';
            await stateManager.updateState(agentId, { 
                status: AgentStatus.READY,
                type: AgentType.DEVELOPER
            });
            
            await stateManager.clear();
            
            const history = await stateManager.getStateHistory(agentId);
            expect(history).toHaveLength(0);
            const state = await stateManager.getState(agentId);
            expect(state).toBeNull();

            // Verify persistence
            const persistedHistory = await stateStore.getStateHistory(agentId);
            expect(persistedHistory).toHaveLength(0);
            const persistedState = await stateStore.getState(agentId);
            expect(persistedState).toBeNull();
        });
    });

    describe('Event Handling', () => {
        it('should allow registering and unregistering state update handlers', async () => {
            const handler = jest.fn();
            const unregister = stateManager.onStateUpdate(handler);

            await stateManager.updateState('test-agent', { 
                status: AgentStatus.READY,
                type: AgentType.DEVELOPER
            });
            expect(handler).toHaveBeenCalledTimes(1);

            unregister();
            await stateManager.updateState('test-agent', { 
                status: AgentStatus.BUSY
            });
            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('should emit stateCleared event', (done) => {
            stateManager.on('stateCleared', () => {
                done();
            });

            stateManager.clear().catch(done);
        });
    });

    describe('Persistence', () => {
        it('should restore state after restart', async () => {
            const agentId = 'test-agent';
            const initialState = await stateManager.updateState(agentId, { 
                status: AgentStatus.READY,
                type: AgentType.DEVELOPER
            });

            await stateManager.shutdown();

            // Create new instance
            const newManager = new StateManager(messageBus, stateStore);
            await newManager.initialize();

            const restoredState = await newManager.getState(agentId);
            expect(restoredState).toEqual(initialState);

            await newManager.shutdown();
        });

        it('should handle initialization errors gracefully', async () => {
            await stateManager.shutdown();
            await fs.chmod(tempDir, 0o000); // Remove all permissions

            const newManager = new StateManager(messageBus, stateStore);
            await expect(newManager.initialize()).rejects.toThrow();

            await fs.chmod(tempDir, 0o755); // Restore permissions
        });
    });
}); 