# MessageBus Documentation

## Overview

The MessageBus is a core component of Orion's communication infrastructure, providing a reliable, type-safe, and asynchronous messaging system for inter-agent communication. It implements a publish-subscribe (pub/sub) pattern, allowing agents to communicate without direct coupling.

## Features

- **Type-safe messaging**: All messages are validated and strongly typed
- **Asynchronous delivery**: Support for both synchronous and asynchronous message handlers
- **Error handling**: Comprehensive error handling with delivery acknowledgments
- **Timeout protection**: Built-in timeout handling for async operations
- **Event emission**: Event-based monitoring of message delivery and errors
- **Resource cleanup**: Proper cleanup of subscriptions and event listeners

## Usage

### Basic Example

```typescript
import { MessageBus } from '../core/messaging/MessageBus';
import { Message, MessageType } from '../types/messages';

// Create a message bus instance
const messageBus = new MessageBus();

// Subscribe to messages
const subscription = messageBus.subscribe('agent-id', async (message) => {
    console.log('Received message:', message);
});

// Publish a message
await messageBus.publish({
    type: MessageType.TASK_ASSIGNMENT,
    sender: 'coordinator',
    recipient: 'agent-id',
    payload: { taskId: '123' }
});

// Unsubscribe when done
messageBus.unsubscribe(subscription);
```

### Error Handling Example

```typescript
// Subscribe with error handling
messageBus.subscribe('agent-id', async (message) => {
    try {
        await processMessage(message);
    } catch (error) {
        throw new Error(`Failed to process message: ${error.message}`);
    }
});

// Monitor for errors
messageBus.on('error', (error) => {
    console.error('Message delivery failed:', error);
});

// Publish with delivery confirmation
const result = await messageBus.publish(message);
if (!result.delivered) {
    console.error('Message delivery failed:', result.error);
}
```

## API Reference

### `MessageBus` Class

#### Constructor
```typescript
constructor()
```
Creates a new MessageBus instance with default configuration.

#### Methods

##### `subscribe`
```typescript
subscribe(recipient: string, callback: MessageCallback): MessageSubscription
```
- **Parameters**:
  - `recipient`: The ID of the recipient to subscribe to
  - `callback`: Function to execute when a message is received
- **Returns**: A subscription object that can be used to unsubscribe
- **Throws**: None
- **Events Emitted**: `'subscribed'`

##### `unsubscribe`
```typescript
unsubscribe(subscription: MessageSubscription): void
```
- **Parameters**:
  - `subscription`: The subscription object returned from `subscribe`
- **Returns**: void
- **Events Emitted**: `'unsubscribed'`

##### `publish`
```typescript
publish(message: Message): Promise<MessageDeliveryResult>
```
- **Parameters**:
  - `message`: The message to publish
- **Returns**: Promise resolving to delivery result
- **Throws**: Error if message format is invalid
- **Events Emitted**: `'delivered'`, `'error'`

##### `shutdown`
```typescript
shutdown(): void
```
- **Purpose**: Cleans up resources and removes all subscriptions
- **Returns**: void

### Types

#### `Message`
```typescript
interface Message {
    type: MessageType;
    sender: string;
    recipient: string;
    payload: Record<string, any>;
    id?: string;
    timestamp?: number;
    correlationId?: string;
}
```

#### `MessageDeliveryResult`
```typescript
interface MessageDeliveryResult {
    delivered: boolean;
    recipients: string[];
    error?: Error;
    timestamp: number;
}
```

#### `MessageSubscription`
```typescript
interface MessageSubscription {
    id: string;
    recipient: string;
    callback: MessageCallback;
}
```

### Events

The MessageBus emits the following events:

- **`'error'`**: Emitted when a delivery error occurs
  - Payload: `Error` object with details
- **`'delivered'`**: Emitted when a message is successfully delivered
  - Payload: `MessageDeliveryResult`
- **`'subscribed'`**: Emitted when a new subscription is created
  - Payload: `MessageSubscription`
- **`'unsubscribed'`**: Emitted when a subscription is removed
  - Payload: Subscription ID (string)

## Best Practices

1. **Error Handling**
   - Always handle potential errors in message callbacks
   - Subscribe to the 'error' event for monitoring
   - Check delivery results when publishing critical messages

2. **Resource Management**
   - Unsubscribe when subscriptions are no longer needed
   - Call `shutdown()` when the MessageBus instance is no longer needed
   - Clear any event listeners added to the MessageBus

3. **Message Design**
   - Keep message payloads serializable
   - Include correlation IDs for related messages
   - Use appropriate message types from `MessageType` enum

4. **Performance**
   - Avoid long-running synchronous operations in callbacks
   - Consider message batching for high-frequency updates
   - Monitor delivery timeouts and adjust as needed

## Limitations

1. **Delivery Guarantees**
   - Messages are delivered at-most-once
   - No persistent message queue
   - No message ordering guarantees between different recipients

2. **Scalability**
   - In-memory message bus, not distributed
   - Single process only
   - No built-in load balancing

3. **Message Size**
   - No built-in message size limits
   - Large messages may impact performance
   - Consider chunking large payloads

## Examples

### Agent Registration
```typescript
// Coordinator subscribing to agent registrations
messageBus.subscribe('coordinator', async (message) => {
    if (message.type === MessageType.AGENT_REGISTER) {
        await registerAgent(message.payload);
        await messageBus.publish({
            type: MessageType.AGENT_READY,
            sender: 'coordinator',
            recipient: message.sender,
            payload: { status: 'registered' }
        });
    }
});
```

### Task Distribution
```typescript
// Coordinator distributing tasks
async function assignTask(task: Task, agentId: string) {
    const result = await messageBus.publish({
        type: MessageType.TASK_ASSIGNMENT,
        sender: 'coordinator',
        recipient: agentId,
        payload: { task },
        correlationId: task.id
    });

    if (!result.delivered) {
        throw new Error(`Failed to assign task to agent ${agentId}`);
    }
}
```

### Error Recovery
```typescript
// Implementing retry logic
async function publishWithRetry(message: Message, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        const result = await messageBus.publish(message);
        if (result.delivered) return result;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
    throw new Error(`Failed to deliver message after ${maxRetries} attempts`);
}
``` 