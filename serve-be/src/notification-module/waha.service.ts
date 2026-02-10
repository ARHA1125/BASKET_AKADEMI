import {
  Injectable,
  Logger,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WahaService implements OnModuleInit {
  private readonly logger = new Logger(WahaService.name);
  private wahaUrl: string;
  private wahaApiKey: string | undefined;
  private webhookUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.wahaUrl =
      this.configService.get<string>('WAHA_API_URL') || 'http://localhost:3000';
    this.wahaApiKey = this.configService.get<string>('WAHA_API_KEY');
    this.webhookUrl =
      this.configService.get<string>('WAHA_WEBHOOK_URL') ||
      'http://host.docker.internal:3005/notifications/waha/webhook';
    this.logger.log(`WAHA Service initialized with URL: ${this.wahaUrl}`);
    this.logger.log(`WAHA Webhook URL: ${this.webhookUrl}`);
  }

  private async autoStartSession() {
    this.logger.log('Checking WhatsApp Session status...');
    try {
      const status = await this.getSessionStatus('default');

      if (status.status === 'STOPPED') {
        this.logger.log(
          'Session stopped. Auto-starting "default" session with Webhook...',
        );
        await this.startSession('default');
        this.logger.log(
          '"default" session started! Webhook set to: ' + this.webhookUrl,
        );
      } else {
        this.logger.log(`Session is already running. Status: ${status.status}`);
      }
    } catch (error) {
      this.logger.error('Failed to auto-start session.', error.message);
    }
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.wahaApiKey ? { 'X-Api-Key': this.wahaApiKey } : {}),
    };
  }

  async sendMessage(
    chatId: string,
    message: string,
    session: string = 'default',
  ) {
    try {
      let formattedChatId = chatId;
      if (!formattedChatId.includes('@')) {
        formattedChatId = formattedChatId.replace(/\D/g, '');
        if (formattedChatId.startsWith('0')) {
          formattedChatId = '62' + formattedChatId.slice(1);
        }
        formattedChatId = `${formattedChatId}@c.us`;
      }

      this.logger.log(
        `Sending message to ${formattedChatId} (Session: ${session}): ${message}`,
      );

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.wahaUrl}/api/sendText`,
          {
            chatId: formattedChatId,
            text: message,
            session: session,
          },
          { headers: this.getHeaders() },
        ),
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      this.logger.error(
        `Failed to send message to ${chatId}`,
        error.response?.data || error.message,
      );

      if (errorMessage && errorMessage.includes('No LID')) {
        throw new BadRequestException(
          'WhatsApp Error: Contact not synced. Try sending to a number you have actively chatted with before.',
        );
      }

      throw error;
    }
  }

  async sendImage(chatId: string, caption: string, imageUrl: string) {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.wahaUrl}/api/sendImage`,
          {
            chatId,
            file: {
              mimetype: 'image/jpeg',
              url: imageUrl,
              filename: 'image.jpg',
            },
            caption: caption,
            session: 'default',
          },
          { headers: this.getHeaders() },
        ),
      );
    } catch (error) {
      this.logger.error(`Failed to send image to ${chatId}`, error.message);
    }
  }

  async getSessionStatus(session: string = 'default') {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.wahaUrl}/api/sessions/${session}`, {
          headers: this.getHeaders(),
        }),
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return { status: 'STOPPED' };
      }
      this.logger.error(
        `Failed to get session status from ${this.wahaUrl}`,
        error.stack,
      );
      return { status: 'DISCONNECTED', error: error.message };
    }
  }

  async getSessionQR(session: string = 'default'): Promise<Buffer> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.wahaUrl}/api/${session}/auth/qr`, {
          responseType: 'arraybuffer',
          headers: this.getHeaders(),
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get QR code`, error.message);
      throw error;
    }
  }

  async stopSession(session: string = 'default') {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.wahaUrl}/api/sessions/${session}/logout`,
          {},
          { headers: this.getHeaders() },
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to stop session`, error.message);
      return { status: 'STOPPED' };
    }
  }

  async startSession(session: string = 'default') {
    const config = {
      name: session,
      config: {
        proxy: null,
        webhooks: [
          {
            url: this.webhookUrl,
            events: ['message', 'session.status', 'message.ack'],
            hmac: null,
          },
        ],
        noweb: {
          store: {
            enabled: true,
            fullSync: false,
          },
        },
      },
    };

    try {
      await firstValueFrom(
        this.httpService.post(`${this.wahaUrl}/api/sessions`, config, {
          headers: this.getHeaders(),
        }),
      );
      this.logger.log(`Session '${session}' created`);
    } catch (error) {
      if (error.response?.status === 409 || error.response?.status === 422) {
        this.logger.log(`Session '${session}' exists, updating config`);

        await firstValueFrom(
          this.httpService.put(
            `${this.wahaUrl}/api/sessions/${session}`,
            config,
            { headers: this.getHeaders() },
          ),
        );
      } else {
        throw error;
      }
    }
    await firstValueFrom(
      this.httpService.post(
        `${this.wahaUrl}/api/sessions/${session}/start`,
        {},
        { headers: this.getHeaders() },
      ),
    );

    this.logger.log(`Session '${session}' started`);
  }

  async onModuleInit() {
    this.logger.log('Checking connection to WAHA Server...');
    await this.autoStartSession();
    try {
      const status = await this.getSessionStatus('default');
      this.logger.log(
        `Connected to WAHA! Session Status: ${JSON.stringify(status)}`,
      );
    } catch (error) {
      this.logger.error(
        'Could not connect to WAHA. Check your API Key or Docker Container.',
      );
    }
  }
}
