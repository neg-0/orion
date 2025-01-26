# API Specification

## Metadata
```yaml
type: implementation
purpose: api-specification
audience: [developers]
last-updated: 2024-03-20
```

## REST Endpoints

### Agent Management
```yaml
# Get all agents
GET /api/agents:
  response:
    agents: Agent[]
    metrics: SystemMetrics

# Get specific agent
GET /api/agents/{agentId}:
  response:
    agent: Agent
    state: AgentState
    processes: Process[]

# Update agent configuration
PUT /api/agents/{agentId}/config:
  request:
    config: AgentConfig
  response:
    success: boolean
    agent: Agent
```

### Process Management
```yaml
# Start a process
POST /api/processes:
  request:
    type: ProcessType
    parameters: Record<string, any>
  response:
    processId: string
    status: ProcessStatus

# Get process status
GET /api/processes/{processId}:
  response:
    process: Process
    status: ProcessStatus
    results?: ProcessResult
```

## WebSocket Events
```yaml
# Agent state updates
agent.state:
  payload:
    agentId: string
    state: AgentState
    timestamp: string

# Process updates
process.update:
  payload:
    processId: string
    status: ProcessStatus
    progress: number
    timestamp: string
``` 