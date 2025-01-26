/// <reference types="jest" />

import { Message, MessageType } from '../../../types/messages';
import { MessageBus } from '../MessageBus';

describe('MessageBus', () => {
    let messageBus: MessageBus;

    beforeEach(() => {
        messageBus = new MessageBus();
    });

    afterEach(() => {
        // Clean up subscriptions and connections
        messageBus.shutdown();
    });

    describe('Message Publishing', () => {
        it('should deliver messages to subscribed recipients', (done) => {
            const testMessage: Message = {
                type: MessageType.TASK_ASSIGNMENT,
                sender: 'coordinator',
                recipient: 'developer',
                payload: { taskId: '123' }
            };

            messageBus.subscribe('developer', (message) => {
                expect(message).toEqual(testMessage);
                done();
            });

            messageBus.publish(testMessage).catch(done);
        });

        it('should not deliver messages to unsubscribed recipients', async () => {
            const mockCallback = jest.fn();
            const testMessage: Message = {
                type: MessageType.TASK_ASSIGNMENT,
                sender: 'coordinator',
                recipient: 'developer',
                payload: { taskId: '123' }
            };

            messageBus.subscribe('tester', mockCallback);
            await messageBus.publish(testMessage);

            expect(mockCallback).not.toHaveBeenCalled();
        });

        it('should validate message format before publishing', async () => {
            const invalidMessage = {
                type: 'INVALID_TYPE',
                sender: 'coordinator'
                // Missing required fields
            };

            await expect(messageBus.publish(invalidMessage as Message))
                .rejects
                .toThrow('Invalid message format');
        });
    });

    describe('Subscription Management', () => {
        it('should allow multiple subscribers for the same recipient', async () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            const testMessage: Message = {
                type: MessageType.TASK_ASSIGNMENT,
                sender: 'coordinator',
                recipient: 'developer',
                payload: { taskId: '123' }
            };

            messageBus.subscribe('developer', callback1);
            messageBus.subscribe('developer', callback2);
            await messageBus.publish(testMessage);

            expect(callback1).toHaveBeenCalledWith(testMessage);
            expect(callback2).toHaveBeenCalledWith(testMessage);
        });

        it('should allow unsubscribing specific callbacks', async () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            const testMessage: Message = {
                type: MessageType.TASK_ASSIGNMENT,
                sender: 'coordinator',
                recipient: 'developer',
                payload: { taskId: '123' }
            };

            const subscription1 = messageBus.subscribe('developer', callback1);
            messageBus.subscribe('developer', callback2);
            
            messageBus.unsubscribe(subscription1);
            await messageBus.publish(testMessage);

            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).toHaveBeenCalledWith(testMessage);
        });
    });

    describe('Message Acknowledgment', () => {
        it('should confirm message delivery to all subscribers', async () => {
            const testMessage: Message = {
                type: MessageType.TASK_ASSIGNMENT,
                sender: 'coordinator',
                recipient: 'developer',
                payload: { taskId: '123' }
            };

            messageBus.subscribe('developer', () => {
                return new Promise(resolve => setTimeout(resolve, 10));
            });

            const result = await messageBus.publish(testMessage);
            expect(result.delivered).toBe(true);
            expect(result.recipients).toEqual(['developer']);
        });

        it('should handle failed deliveries gracefully', async () => {
            const testMessage: Message = {
                type: MessageType.TASK_ASSIGNMENT,
                sender: 'coordinator',
                recipient: 'developer',
                payload: { taskId: '123' }
            };

            messageBus.subscribe('developer', () => {
                throw new Error('Delivery failed');
            });

            const result = await messageBus.publish(testMessage);
            expect(result.delivered).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('Error Handling', () => {
        it('should handle subscriber errors without affecting other subscribers', async () => {
            const errorCallback = jest.fn(() => {
                throw new Error('Subscriber error');
            });
            const successCallback = jest.fn();
            const testMessage: Message = {
                type: MessageType.TASK_ASSIGNMENT,
                sender: 'coordinator',
                recipient: 'developer',
                payload: { taskId: '123' }
            };

            messageBus.subscribe('developer', errorCallback);
            messageBus.subscribe('developer', successCallback);
            await messageBus.publish(testMessage);

            expect(successCallback).toHaveBeenCalledWith(testMessage);
        });

        it('should emit error events for failed deliveries', async () => {
            const testMessage: Message = {
                type: MessageType.TASK_ASSIGNMENT,
                sender: 'coordinator',
                recipient: 'developer',
                payload: { taskId: '123' }
            };

            const errorPromise = new Promise<void>((resolve) => {
                messageBus.on('error', (error) => {
                    expect(error.message).toContain('Delivery failed');
                    resolve();
                });
            });

            messageBus.subscribe('developer', () => {
                throw new Error('Delivery failed');
            });

            await Promise.all([
                messageBus.publish(testMessage),
                errorPromise
            ]);
        });
    });
}); 