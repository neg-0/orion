# Agent Definitions and Responsibilities

## Metadata
```yaml
type: agent-definitions
purpose: role-specification
audience: [ai-agents, developers]
last-updated: 2024-03-20
```

## Strategic Agents

### Coordinator Agent
```yaml
type: strategic
priority: highest
responsibilities:
  - Orchestrate agent interactions
  - Manage task prioritization
  - Handle conflict resolution
  - Ensure system consistency
capabilities:
  - Global state management
  - Decision arbitration
  - Resource allocation
```

### Architect Agent
```yaml
type: strategic
priority: high
responsibilities:
  - System design oversight
  - Architecture evolution
  - Technical debt management
  - Design pattern enforcement
capabilities:
  - Architecture analysis
  - Design validation
  - Pattern recognition
  - Impact assessment
```

## Tactical Agents

### Developer Agent
```yaml
type: tactical
priority: high
responsibilities:
  - Code implementation
  - Refactoring
  - Unit test creation
  - Documentation updates
capabilities:
  - Code generation
  - Code analysis
  - Test writing
  - Documentation generation
```

### Testing Agent
```yaml
type: tactical
priority: high
responsibilities:
  - Test strategy development
  - Test case generation
  - Test execution
  - Quality assurance
capabilities:
  - Test planning
  - Test automation
  - Coverage analysis
  - Performance testing
```

### DevOps Agent
```yaml
type: tactical
priority: high
responsibilities:
  - Deployment management
  - Infrastructure setup
  - CI/CD pipeline maintenance
  - Environment management
capabilities:
  - Infrastructure as code
  - Pipeline automation
  - Deployment orchestration
  - Configuration management
```

## Support Agents

### Analyzer Agent
```yaml
type: support
priority: medium
responsibilities:
  - Code quality analysis
  - Performance monitoring
  - Security scanning
  - Dependency management
capabilities:
  - Static analysis
  - Dynamic analysis
  - Vulnerability scanning
  - Metric collection
```

### Monitoring Agent
```yaml
type: support
priority: medium
responsibilities:
  - System health monitoring
  - Performance tracking
  - Resource utilization
  - Alert management
capabilities:
  - Real-time monitoring
  - Log analysis
  - Alert generation
  - Trend analysis
``` 