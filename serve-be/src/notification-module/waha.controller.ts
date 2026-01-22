import * as fs from 'fs';
import * as path from 'path';
import { Controller, Get, Post, Res, Body, Query, Param } from '@nestjs/common';
import { WahaService } from './waha.service';
import { NotificationRulesService } from './notification-rules.service';
import { Response } from 'express';
import { Roles } from '../common/decorators/role.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '../auths-module/entities/user.entity';

@Roles(UserRole.ADMIN)
@Controller('notifications/waha')
export class WahaController {
  constructor(
    private readonly wahaService: WahaService,
    private readonly rulesService: NotificationRulesService
  ) {}

  @Get('status')
  async getStatus(@Query('session') session: string = 'default') {
    return this.wahaService.getSessionStatus(session);
  }

  @Get('qr')
  async getQR(@Res() res: Response, @Query('session') session: string = 'default') {
    try {
      const imageBuffer = await this.wahaService.getSessionQR(session);
      res.set('Content-Type', 'image/png');
      res.send(imageBuffer);
    } catch (error) {
      res.status(404).send('QR Code not available');
    }
  }

  @Post('start')
  async startSession(@Body('session') session: string = 'default') {
    return this.wahaService.startSession(session);
  }

  @Post('stop')
  async stopSession(@Body('session') session: string = 'default') {
    return this.wahaService.stopSession(session);
  }

  @Post('send-text')
  async sendText(@Body() body: { chatId: string; message: string; session?: string }) {
    return this.wahaService.sendMessage(body.chatId, body.message, body.session);
  }


  // In-memory Cooldown Tracker (ChatId -> LastReplyTimestamp)
  private lastAutoReply = new Map<string, number>();
  private readonly COOLDOWN_MS = 5 * 60 * 1000; // 5 Minutes

  @Public()
  @Post('webhook')
  async handleWebhook(@Body() payload: any) {
    const logFile = path.join(process.cwd(), 'debug-waha.log');
    const log = (msg: string) => fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);

    if (!payload) return { status: 'ok' };
    const event = payload.event;
    const data = payload.payload;
    
    // console.log(`[Webhook] Event: ${event}, ID: ${data?.id}`);
    log(`Event: ${event}, ID: ${data?.id}`);

    if (event === 'message' || event === 'message.any') {
        if (data.fromMe) {
            log(`Ignored - Message is fromMe.`);
            return; 
        }
        if (data.from === 'status@broadcast') {
            return; 
        }

        const text = data.body;
        const chatId = data.from;
        log(`Processing Message from ${chatId}: "${text}"`);

        if (text && chatId) {
            // Check Cooldown
            const lastReply = this.lastAutoReply.get(chatId) || 0;
            const now = Date.now();
            
            if (now - lastReply < this.COOLDOWN_MS) {
                const remaining = Math.ceil((this.COOLDOWN_MS - (now - lastReply)) / 1000);
                log(`IGNORED: Cooldown active for ${chatId}. Retrying in ${remaining}s.`);
                return { status: 'ignored_cooling_down' };
            }

            const rule = await this.rulesService.findMatchingRule(text);
            if (rule) {
                log(`MATCH FOUND: Auto-replying with rule "${rule.name}" (Content: "${rule.response}") on session "${payload.session || 'default'}"`);
                
                // Update Timestamp
                this.lastAutoReply.set(chatId, Date.now());

                setTimeout(() => {
                    this.wahaService.sendMessage(chatId, rule.response, payload.session || 'default')
                        .then(() => log(`Sent reply to ${chatId}`))
                        .catch(err => log(`Send Error: ${err.message}`));
                }, 1000);
            } else {
                log(`No matching rule found for text: "${text}"`);
            }
        }
    }
    return { status: 'ok' };
  }
}
