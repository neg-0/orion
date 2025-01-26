# StateManager Documentation

## Overview

The StateManager is a core component of Orion's agent system that provides centralized state management and synchronization. It maintains the current state of all agents, tracks state history, and broadcasts state changes to interested subscribers. The system includes a persistence layer that ensures state durability across system restarts.

## Features

- **Centralized State Management**: Single source of truth for agent states
- **State History**: Maintains a configurable history of state changes
- **Event-Based Updates**: Real-time state change notifications
- **Query Capabilities**: Filter and retrieve states based on various criteria
- **Type Safety**: Strongly typed state updates and queries
- **Broadcast Integration**: Automatic state change broadcasting via MessageBus
- **Persistence**: Durable state storage with automatic recovery
- **Auto-Save**: Configurable auto-save intervals for state persistence
- **Concurrent Access**: Thread-safe state operations

## Usage

### Basic Example with Persistence

```typescript
import { StateManager } from '../core/state/StateManager';
import { MessageBus } from '../core/messaging/MessageBus';
import { FileStateStore } from '../core/state/persistence/FileStateStore';
import { AgentStatus } from '../types/agent';

// Create dependencies
const messageBus = new MessageBus();
const stateStore = new FileStateStore('/path/to/storage', {
    historyLimit: 1000,
    autoSaveInterval: 5000 // Auto-save every 5 seconds
});

// Create and initialize state manager
const stateManager = new StateManager(messageBus, stateStore, {
    historyLimit: 1000
});
await stateManager.initialize();

// Update agent state
await stateManager.updateState('agent-id', {
    status: AgentStatus.READY,
    tasks: []
});

// Get current state
const state = await stateManager.getState('agent-id');

// Subscribe to state updates
const unsubscribe = stateManager.onStateUpdate(update => {
    console.log('State updated:', update);
});

// Clean up when done
unsubscribe();
await stateManager.shutdown();
```

### State Recovery Example

```typescript
// System startup
async function initializeSystem() {
    const stateStore = new FileStateStore('/path/to/storage');
    const stateManager = new StateManager(messageBus, stateStore);
    
    try {
        await stateManager.initialize();
        const states = await stateManager.getAllStates();
        console.log(`Recovered ${states.size} agent states`);
    } catch (error) {
        console.error('Failed to recover state:', error);
        // Handle initialization failure
    }
}
```

## API Reference

### `StateManager` Class

#### Constructor
```typescript
constructor(
    messageBus: MessageBus,
    store: StateStore,
    options?: StateManagerOptions
)
```
Creates a new StateManager instance.
- **Parameters**:
  - `messageBus`: MessageBus instance for broadcasting updates
  - `store`: StateStore implementation for persistence
  - `options.historyLimit`: Maximum number of historical states to maintain (default: 1000)
  - `options.autoSaveInterval`: Milliseconds between auto-saves (default: 5000)

#### Methods

##### `initialize`
```typescript
async initialize(): Promise<void>
```
- **Purpose**: Initialize the state manager and load persisted state
- **Returns**: Promise that resolves when initialization is complete
- **Throws**: Error if initialization fails

##### `shutdown`
```typescript
async shutdown(): Promise<void>
```
- **Purpose**: Gracefully shutdown the state manager and persist final state
- **Returns**: Promise that resolves when shutdown is complete

##### `updateState`
```typescript
async updateState(agentId: string, update: Partial<AgentState>): Promise<AgentState>
```
- **Parameters**:
  - `agentId`: The ID of the agent to update
  - `update`: Partial state update to apply
- **Returns**: The complete updated state
- **Events Emitted**: `'stateUpdated'`
- **Broadcasts**: `MessageType.STATE_UPDATE`
- **Persists**: State and history

##### `getState`
```typescript
getState(agentId: string): AgentState | null
```
- **Parameters**:
  - `agentId`: The ID of the agent
- **Returns**: Current state or null if not found

##### `getAllStates`
```typescript
getAllStates(): Map<string, AgentState>
```
- **Returns**: Map of all current agent states

##### `queryStates`
```typescript
queryStates(query: StateQuery): AgentState[]
```
- **Parameters**:
  - `query`: Query criteria (status, timestamp range, etc.)
- **Returns**: Array of matching states

##### `getStateHistory`
```typescript
getStateHistory(agentId: string, limit?: number): StateUpdate[]
```
- **Parameters**:
  - `agentId`: The ID of the agent
  - `limit`: Maximum number of history entries to return
- **Returns**: Array of state updates in reverse chronological order

##### `clear`
```typescript
clear(): void
```
- **Purpose**: Clears all state data and history
- **Events Emitted**: `'stateCleared'`

##### `onStateUpdate`
```typescript
onStateUpdate(handler: (update: StateUpdate) => void): () => void
```
- **Parameters**:
  - `handler`: Callback function for state updates
- **Returns**: Function to unregister the handler

### Types

#### `StateUpdate`
```typescript
interface StateUpdate {
    agentId: string;
    state: Partial<AgentState>;
    timestamp: number;
}
```

#### `StateQuery`
```typescript
interface StateQuery {
    agentId?: string;
    status?: AgentStatus;
    timestamp?: {
        before?: number;
        after?: number;
    };
}
```

### Events

The StateManager emits the following events:

- **`'stateUpdated'`**: Emitted when an agent's state is updated
  - Payload: `StateUpdate` object
- **`'stateCleared'`**: Emitted when all state data is cleared
  - Payload: none

### Persistence Layer

#### `StateStore` Interface

The persistence layer is defined by the `StateStore` interface:

```typescript
interface StateStore {
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    saveState(agentId: string, state: AgentState): Promise<void>;
    getState(agentId: string): Promise<AgentState | null>;
    getAllStates(): Promise<Map<string, AgentState>>;
    saveStateUpdate(update: StateUpdate): Promise<void>;
    getStateHistory(agentId: string, limit?: number): Promise<StateUpdate[]>;
    clear(): Promise<void>;
}
```

#### `FileStateStore` Implementation

The default implementation uses file-based storage:

```typescript
const store = new FileStateStore('/path/to/storage', {
    historyLimit: 1000,    // Maximum history entries
    autoSaveInterval: 5000 // Auto-save interval in ms
});
```

Features:
- **Atomic Updates**: File writes are atomic to prevent corruption
- **Auto-Recovery**: Handles corrupted files and missing directories
- **Concurrent Access**: Safe for concurrent operations
- **Auto-Save**: Periodic state persistence
- **Date Handling**: Proper serialization of Date objects
- **Version Control**: Storage format versioning for future upgrades

## Best Practices

1. **Initialization**
   - Always call `initialize()` before using the StateManager
   - Handle initialization failures gracefully
   - Consider implementing retry logic for initialization

2. **State Updates**
   - Keep state updates atomic and minimal
   - Use partial updates to modify only changed fields
   - Always handle the promise returned by `updateState`
   - Consider batching frequent updates

3. **Query Performance**
   - Use specific queries instead of filtering `getAllStates`
   - Consider timestamp ranges for historical queries
   - Limit history results for large datasets

4. **Event Handling**
   - Clean up event handlers when no longer needed
   - Use `onStateUpdate` for temporary subscriptions
   - Handle errors in event callbacks

5. **Resource Management**
   - Call `shutdown()` when shutting down
   - Unsubscribe from events when components unmount
   - Monitor history size for memory usage

6. **Persistence**
   - Choose appropriate auto-save intervals
   - Monitor disk space and I/O performance
   - Implement backup strategies for state files
   - Handle storage errors gracefully

## Examples

### State Recovery with Validation
```typescript
async function recoverAgentStates() {
    const states = await stateManager.getAllStates();
    
    for (const [agentId, state] of states) {
        if (state.status === AgentStatus.BUSY) {
            const history = await stateManager.getStateHistory(agentId, 1);
            const lastUpdate = history[0]?.timestamp || 0;
            
            if (Date.now() - lastUpdate > 300000) { // 5 minutes
                await stateManager.updateState(agentId, {
                    status: AgentStatus.ERROR,
                    lastError: 'Agent unresponsive'
                });
            }
        }
    }
}
```

### Backup and Restore
```typescript
async function backupState(backupPath: string) {
    const states = await stateManager.getAllStates();
    const history = await stateManager.getStateHistory('', 1000);
    
    const backup = {
        timestamp: Date.now(),
        states: Array.from(states.entries()),
        history
    };
    
    await fs.writeFile(backupPath, JSON.stringify(backup));
}

async function restoreFromBackup(backupPath: string) {
    const backup = JSON.parse(await fs.readFile(backupPath, 'utf-8'));
    
    await stateManager.clear();
    for (const [agentId, state] of backup.states) {
        await stateManager.updateState(agentId, state);
    }
}
``` 