export interface PendingMessage {
  id: string;
  content: string;
  chatId: string;
  timestamp: number;
  retryCount: number;
}

class MessageQueue {
  private queue: PendingMessage[] = [];
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  addMessage(
    message: Omit<PendingMessage, "id" | "timestamp" | "retryCount">,
  ): string {
    const pendingMessage: PendingMessage = {
      ...message,
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(pendingMessage);
    return pendingMessage.id;
  }

  removeMessage(id: string): void {
    this.queue = this.queue.filter((msg) => msg.id !== id);
  }

  getMessages(): PendingMessage[] {
    return [...this.queue];
  }

  async retryFailedMessages(
    sendFunction: (message: PendingMessage) => Promise<boolean>,
  ): Promise<void> {
    const retryableMessages = this.queue.filter(
      (msg) => msg.retryCount < this.maxRetries,
    );

    for (const message of retryableMessages) {
      try {
        const success = await sendFunction(message);
        if (success) {
          this.removeMessage(message.id);
        } else {
          message.retryCount++;
          if (message.retryCount >= this.maxRetries) {
            console.error(
              `Message ${message.id} failed after ${this.maxRetries} retries`,
            );
            this.removeMessage(message.id);
          }
        }
      } catch (error) {
        console.error(`Error retrying message ${message.id}:`, error);
        message.retryCount++;
        if (message.retryCount >= this.maxRetries) {
          this.removeMessage(message.id);
        }
      }

      // Small delay between retries
      if (retryableMessages.indexOf(message) < retryableMessages.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
      }
    }
  }

  clear(): void {
    this.queue = [];
  }
}

export const messageQueue = new MessageQueue();
