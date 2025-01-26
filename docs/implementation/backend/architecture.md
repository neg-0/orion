# Backend Architecture

## Metadata
```yaml
type: implementation
purpose: backend-architecture
audience: [developers]
last-updated: 2024-03-20
```

## Directory Structure
```
orion-backend/
├── src/
│   ├── agents/              # Agent implementation
│   │   ├── base/           # Base agent classes
│   │   ├── coordinator/    # Coordinator agent
│   │   ├── developer/      # Developer agent
│   │   └── analyzer/       # Analyzer agent
│   ├── core/               # Core functionality
│   │   ├── messaging/      # Message bus implementation
│   │   ├── state/         # State management
│   │   └── knowledge/     # Knowledge base
│   ├── api/                # REST API endpoints
│   │   ├── routes/        # Route definitions
│   │   └── controllers/   # Request handlers
│   ├── db/                 # Database connections
│   ├── services/           # Business logic
│   └── utils/              # Utility functions
├── tests/                  # Test files
└── config/                 # Configuration files
```

## Core Components

### 1. Agent System
```typescript
// src/agents/base/BaseAgent.ts
abstract class BaseAgent {
    protected messageBus: MessageBus;
    protected stateManager: StateManager;
    protected config: AgentConfig;

    abstract initialize(): Promise<void>;
    abstract handleMessage(message: Message): Promise<void>;
    abstract shutdown(): Promise<void>;
}
```

### 2. Message Bus
```typescript
// src/core/messaging/MessageBus.ts
class MessageBus {
    private subscribers: Map<string, Set<MessageHandler>>;
    private eventStore: EventStore;

    async publish(topic: string, message: Message): Promise<void>;
    subscribe(topic: string, handler: MessageHandler): void;
    unsubscribe(topic: string, handler: MessageHandler): void;
}
```

### 3. State Management
```typescript
// src/core/state/StateManager.ts
class StateManager {
    private store: StateStore;
    private eventBus: MessageBus;

    async updateState(agentId: string, state: Partial<AgentState>): Promise<void>;
    async getState(agentId: string): Promise<AgentState>;
    async rollback(agentId: string, timestamp: Date): Promise<void>;
}
``` 