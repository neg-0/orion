import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import {
    Message,
    MessageBusEvents,
    MessageCallback,
    MessageDeliveryResult,
    MessageSubscription
} from '../../types/messages';

export class MessageBus extends EventEmitter {
    private subscriptions: Map<string, MessageSubscription[]>;
    private readonly DEFAULT_TIMEOUT = 5000; // 5 seconds

    constructor() {
        super();
        this.subscriptions = new Map();

        // Handle any unhandled errors
        this.on('error', () => {
            // Prevent Node from crashing on unhandled error events
        });
    }

    /**
     * Subscribe to messages for a specific recipient
     * @param recipient The recipient to subscribe to
     * @param callback The callback to execute when a message is received
     * @returns A subscription object that can be used to unsubscribe
     */
    subscribe(recipient: string, callback: MessageCallback): MessageSubscription {
        const subscription: MessageSubscription = {
            id: uuidv4(),
            recipient,
            callback
        };

        const recipientSubs = this.subscriptions.get(recipient) || [];
        recipientSubs.push(subscription);
        this.subscriptions.set(recipient, recipientSubs);

        this.emit('subscribed', subscription);
        return subscription;
    }

    /**
     * Unsubscribe from messages
     * @param subscription The subscription to remove
     */
    unsubscribe(subscription: MessageSubscription): void {
        const recipientSubs = this.subscriptions.get(subscription.recipient);
        if (!recipientSubs) return;

        const index = recipientSubs.findIndex(sub => sub.id === subscription.id);
        if (index !== -1) {
            recipientSubs.splice(index, 1);
            if (recipientSubs.length === 0) {
                this.subscriptions.delete(subscription.recipient);
            } else {
                this.subscriptions.set(subscription.recipient, recipientSubs);
            }
            this.emit('unsubscribed', subscription.id);
        }
    }

    /**
     * Publish a message to subscribers
     * @param message The message to publish
     * @returns A promise that resolves with the delivery result
     */
    async publish(message: Message): Promise<MessageDeliveryResult> {
        this.validateMessage(message);

        const result: MessageDeliveryResult = {
            delivered: false,
            recipients: [],
            timestamp: Date.now()
        };

        const subscribers = this.subscriptions.get(message.recipient) || [];
        if (subscribers.length === 0) {
            return result;
        }

        let hasErrors = false;
        const deliveryErrors: Error[] = [];

        try {
            const deliveryPromises = subscribers.map(async sub => {
                try {
                    await this.deliverToSubscriber(message, sub);
                    return true;
                } catch (error) {
                    hasErrors = true;
                    const wrappedError = error instanceof Error ? error : new Error(String(error));
                    const deliveryError = new Error(`Delivery failed to ${sub.recipient}: ${wrappedError.message}`);
                    deliveryErrors.push(deliveryError);
                    this.emit('error', deliveryError);
                    return false;
                }
            });

            const deliveryResults = await Promise.all(deliveryPromises);
            const successfulDeliveries = deliveryResults.filter(Boolean).length;

            result.delivered = successfulDeliveries > 0;
            if (result.delivered) {
                result.recipients = [message.recipient];
            }

            if (hasErrors) {
                if (deliveryErrors.length === 1) {
                    result.error = deliveryErrors[0];
                } else {
                    result.error = new Error(
                        `Multiple delivery failures: ${deliveryErrors.map(e => e.message).join('; ')}`
                    );
                }
            }

            this.emit('delivered', result);
        } catch (error) {
            const wrappedError = error instanceof Error ? error : new Error(String(error));
            result.error = wrappedError;
            this.emit('error', wrappedError);
        }

        return result;
    }

    /**
     * Shutdown the message bus and clean up resources
     */
    shutdown(): void {
        this.subscriptions.clear();
        this.removeAllListeners();
    }

    private validateMessage(message: Message): void {
        if (!message.type || !message.sender || !message.recipient) {
            throw new Error('Invalid message format: missing required fields');
        }
    }

    private async deliverToSubscriber(
        message: Message,
        subscription: MessageSubscription
    ): Promise<void> {
        try {
            const result = subscription.callback(message);
            if (result instanceof Promise) {
                await Promise.race([
                    result,
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Delivery timeout')), this.DEFAULT_TIMEOUT)
                    )
                ]);
            }
        } catch (error) {
            throw error instanceof Error ? error : new Error(String(error));
        }
    }
}

// Type assertion to ensure MessageBus implements all event handlers
const _: { new(): EventEmitter & { on: MessageBusEvents } } = MessageBus as any; 