import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WhatsappSyncQueue {
  constructor(@InjectQueue('whatsapp-sync') private readonly queue: Queue) {}

  async enqueueSync(sessionId: string) {
    await this.queue.add(
      'sync-all',
      { sessionId },
      {
        delay: 30000,
        attempts: 4,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: 50,
      },
    );
  }

  // sync periódico mientras el cliente esté conectado
  async scheduleRecurringSync(sessionId: string) {
    await this.queue.upsertJobScheduler(
      `recurring-${sessionId}`, // ID estable del scheduler
      { every: 3 * 60 * 1000 }, // cada 3 min
      {
        name: 'sync-all',
        data: { sessionId },
        opts: { removeOnComplete: true },
      },
    );
  }

  async stopRecurringSync(sessionId: string) {
    await this.queue.removeJobScheduler(`recurring-${sessionId}`);
  }
}
