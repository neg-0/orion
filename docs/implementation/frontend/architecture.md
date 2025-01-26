# Frontend Architecture

## Metadata
```yaml
type: implementation
purpose: frontend-architecture
audience: [developers]
last-updated: 2024-03-20
```

## Directory Structure
```
orion-frontend/
├── src/
│   ├── components/         # React components
│   │   ├── agents/        # Agent-related components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── monitoring/    # Monitoring components
│   │   └── common/        # Shared components
│   ├── store/             # Redux store
│   │   ├── slices/        # Redux slices
│   │   └── middleware/    # Redux middleware
│   ├── api/               # API client
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript types
├── public/                # Static files
└── tests/                 # Test files
```

## Core Features

### 1. Agent Dashboard
```typescript
// src/components/dashboard/AgentDashboard.tsx
interface AgentDashboardProps {
    agents: Agent[];
    metrics: SystemMetrics;
    onAgentAction: (action: AgentAction) => void;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({
    agents,
    metrics,
    onAgentAction
}) => {
    // Dashboard implementation
};
```

### 2. State Management
```typescript
// src/store/slices/agentSlice.ts
interface AgentState {
    agents: Record<string, Agent>;
    activeProcesses: Process[];
    metrics: SystemMetrics;
}

const agentSlice = createSlice({
    name: 'agents',
    initialState,
    reducers: {
        agentStateUpdated(state, action: PayloadAction<AgentUpdate>),
        processStarted(state, action: PayloadAction<Process>),
        processCompleted(state, action: PayloadAction<ProcessResult>)
    }
});
```

### 3. Real-time Updates
```typescript
// src/api/websocket.ts
class AgentWebSocket {
    private ws: WebSocket;
    private store: Store;

    constructor(url: string, store: Store) {
        this.ws = new WebSocket(url);
        this.store = store;
        this.setupHandlers();
    }

    private handleStateUpdate(update: AgentStateUpdate): void {
        this.store.dispatch(agentStateUpdated(update));
    }
}
``` 