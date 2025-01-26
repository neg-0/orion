/// <reference types="jest" />

import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { AgentState, AgentStatus, AgentType } from '../../../../types/agent';
import { StateUpdate } from '../../StateManager';
import { FileStateStore } from '../FileStateStore';

describe('FileStateStore', () => {
    let stateStore: FileStateStore;
    let tempDir: string;
    let storePath: string;

    beforeEach(async () => {
        // Create a temporary directory for testing
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'state-store-test-'));
        storePath = path.join(tempDir, 'state-store.json');
        stateStore = new FileStateStore(tempDir, { autoSaveInterval: 0 }); // Disable auto-save for testing
        await stateStore.initialize();
    });

    afterEach(async () => {
        await stateStore.shutdown();
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    describe('State Storage', () => {
        it('should save and retrieve agent state', async () => {
            const testState: AgentState = {
                id: 'test-agent',
                type: AgentType.DEVELOPER,
                status: AgentStatus.READY,
                tasks: [],
                capabilities: ['test'],
                metrics: {},
                lastUpdate: new Date()
            };

            await stateStore.saveState('test-agent', testState);
            const retrievedState = await stateStore.getState('test-agent');

            expect(retrievedState).toEqual(testState);
        });

        it('should handle multiple agent states', async () => {
            const states: AgentState[] = [
                {
                    id: 'agent1',
                    type: AgentType.DEVELOPER,
                    status: AgentStatus.READY,
                    tasks: [],
                    capabilities: [],
                    metrics: {},
                    lastUpdate: new Date()
                },
                {
                    id: 'agent2',
                    type: AgentType.ANALYZER,
                    status: AgentStatus.BUSY,
                    tasks: [],
                    capabilities: [],
                    metrics: {},
                    lastUpdate: new Date()
                }
            ];

            await Promise.all(states.map(state => stateStore.saveState(state.id, state)));
            const allStates = await stateStore.getAllStates();

            expect(allStates.size).toBe(2);
            states.forEach(state => {
                expect(allStates.get(state.id)).toEqual(state);
            });
        });

        it('should persist state across store instances', async () => {
            const testState: AgentState = {
                id: 'test-agent',
                type: AgentType.DEVELOPER,
                status: AgentStatus.READY,
                tasks: [],
                capabilities: [],
                metrics: {},
                lastUpdate: new Date()
            };

            await stateStore.saveState('test-agent', testState);
            await stateStore.shutdown();

            // Create a new instance
            const newStore = new FileStateStore(tempDir, { autoSaveInterval: 0 });
            await newStore.initialize();

            const retrievedState = await newStore.getState('test-agent');
            expect(retrievedState).toEqual(testState);

            await newStore.shutdown();
        });
    });

    describe('State History', () => {
        it('should maintain state update history', async () => {
            const updates: StateUpdate[] = [
                {
                    agentId: 'test-agent',
                    state: { status: AgentStatus.INITIALIZING },
                    timestamp: Date.now()
                },
                {
                    agentId: 'test-agent',
                    state: { status: AgentStatus.READY },
                    timestamp: Date.now() + 1000
                }
            ];

            await Promise.all(updates.map(update => stateStore.saveStateUpdate(update)));
            const history = await stateStore.getStateHistory('test-agent');

            expect(history).toHaveLength(2);
            expect(history[0].state.status).toBe(AgentStatus.READY);
            expect(history[1].state.status).toBe(AgentStatus.INITIALIZING);
        });

        it('should respect history limit', async () => {
            const storeWithLimit = new FileStateStore(tempDir, { historyLimit: 2, autoSaveInterval: 0 });
            await storeWithLimit.initialize();

            const updates: StateUpdate[] = [
                {
                    agentId: 'test-agent',
                    state: { status: AgentStatus.INITIALIZING },
                    timestamp: Date.now()
                },
                {
                    agentId: 'test-agent',
                    state: { status: AgentStatus.READY },
                    timestamp: Date.now() + 1000
                },
                {
                    agentId: 'test-agent',
                    state: { status: AgentStatus.BUSY },
                    timestamp: Date.now() + 2000
                }
            ];

            await Promise.all(updates.map(update => storeWithLimit.saveStateUpdate(update)));
            const history = await storeWithLimit.getStateHistory('test-agent');

            expect(history).toHaveLength(2);
            expect(history[0].state.status).toBe(AgentStatus.BUSY);
            expect(history[1].state.status).toBe(AgentStatus.READY);

            await storeWithLimit.shutdown();
        });
    });

    describe('Error Handling', () => {
        it('should handle missing storage file gracefully', async () => {
            const emptyStore = new FileStateStore(path.join(tempDir, 'empty'), { autoSaveInterval: 0 });
            await emptyStore.initialize();

            const states = await emptyStore.getAllStates();
            expect(states.size).toBe(0);

            await emptyStore.shutdown();
        });

        it('should handle concurrent access', async () => {
            const updates = Array.from({ length: 10 }, (_, i) => ({
                agentId: 'test-agent',
                state: { status: AgentStatus.READY, metrics: { count: i } },
                timestamp: Date.now() + i
            }));

            // Simulate concurrent updates
            await Promise.all(updates.map(update => stateStore.saveStateUpdate(update)));
            const history = await stateStore.getStateHistory('test-agent');

            expect(history).toHaveLength(10);
            expect(new Set(history.map(h => h.state.metrics.count)).size).toBe(10);
        });
    });

    describe('Cleanup', () => {
        it('should clear all data', async () => {
            const testState: AgentState = {
                id: 'test-agent',
                type: AgentType.DEVELOPER,
                status: AgentStatus.READY,
                tasks: [],
                capabilities: [],
                metrics: {},
                lastUpdate: new Date()
            };

            await stateStore.saveState('test-agent', testState);
            await stateStore.clear();

            const states = await stateStore.getAllStates();
            const history = await stateStore.getStateHistory('test-agent');

            expect(states.size).toBe(0);
            expect(history).toHaveLength(0);
        });

        it('should handle shutdown and cleanup properly', async () => {
            await stateStore.shutdown();
            
            // Verify the file exists and is valid JSON
            const content = await fs.readFile(storePath, 'utf-8');
            const data = JSON.parse(content);
            
            expect(data).toHaveProperty('states');
            expect(data).toHaveProperty('history');
            expect(data).toHaveProperty('version');
        });
    });
}); 