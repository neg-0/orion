# Agent Interaction Protocols

## Metadata
```yaml
type: protocols
purpose: agent-communication
audience: [ai-agents, developers]
last-updated: 2024-03-20
```

## Communication Patterns

### 1. Request-Response
```yaml
pattern: request-response
use-case: direct-queries
example:
  request:
    type: code-analysis
    target: file-path
    scope: function-level
  response:
    type: analysis-result
    findings: []
    metrics: {}
```

### 2. Event Broadcasting
```yaml
pattern: pub-sub
use-case: system-events
example:
  event:
    type: code-change
    source: developer-agent
    payload:
      files: []
      impact: {}
```

### 3. State Updates
```yaml
pattern: state-transition
use-case: progress-tracking
example:
  update:
    type: task-progress
    status: in-progress
    completion: 0.65
    metrics: {}
```

## Agent Responsibilities

### Analyzer Agent
- Monitors system state
- Identifies improvement opportunities
- Generates analysis reports

### Architect Agent
- Reviews system design
- Proposes architectural changes
- Maintains design consistency

### Developer Agent
- Implements approved changes
- Follows coding standards
- Generates tests

### Coordinator Agent
- Manages agent interactions
- Prioritizes tasks
- Resolves conflicts 