import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { WahaService } from './waha.service';
import { Logger } from '@nestjs/common';

@Processor('notification')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly wahaService: WahaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
    const { chatId, message, type } = job.data;

    // Simulate random delay 5-10s
    const delay = Math.floor(Math.random() * 5000) + 5000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    if (type === 'text') {
        // Pass session if available in job data
        await this.wahaService.sendMessage(chatId, message, job.data.session);
    }
    // Add image handling etc
  }
}
