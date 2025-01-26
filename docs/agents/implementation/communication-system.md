# Agent Communication System

## Metadata
```yaml
type: implementation
purpose: technical-specification
audience: [developers]
last-updated: 2024-03-20
```

## Message Types

```typescript
enum MessageType {
    COMMAND = 'command',
    QUERY = 'query',
    EVENT = 'event',
    RESPONSE = 'response',
    ERROR = 'error',
    STATUS = 'status'
}

interface MessageMetadata {
    correlationId: string;
    priority: Priority;
    ttl?: number;
    retryCount?: number;
    trace?: string[];
}

interface Command extends Message {
    type: MessageType.COMMAND;
    payload: {
        action: string;
        parameters: Record<string, any>;
        context?: Record<string, any>;
    };
}

interface Event extends Message {
    type: MessageType.EVENT;
    payload: {
        eventType: string;
        data: any;
        timestamp: Date;
    };
}
```

## Communication Patterns

### 1. Request-Response
```typescript
async function requestResponse(agent: BaseAgent, message: Message): Promise<Response> {
    const correlationId = generateCorrelationId();
    const response = new Promise((resolve, reject) => {
        // Set up temporary response handler
        messageBus.subscribeOnce(
            `response.${correlationId}`,
            (response) => resolve(response)
        );
        
        // Set up timeout
        setTimeout(() => reject(new Error('Timeout')), REQUEST_TIMEOUT);
    });
    
    // Send request
    await messageBus.publish(message.recipient, {
        ...message,
        metadata: { ...message.metadata, correlationId }
    });
    
    return response;
}
```

### 2. Event Broadcasting
```typescript
async function broadcastEvent(agent: BaseAgent, event: Event): Promise<void> {
    // Log event for tracing
    await agent.eventLogger.log(event);
    
    // Broadcast to all interested parties
    await messageBus.publish('events', event);
    
    // Notify monitoring system
    await agent.monitor.trackEvent(event);
}
``` 