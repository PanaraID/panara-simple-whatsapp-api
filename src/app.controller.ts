import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { WhatsappService } from './whatsapp/whatsapp.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly whatsappService: WhatsappService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/scan')
   async register(@Query('phoneNumber') phoneNumber: string) {
    if (!phoneNumber) {
      // Handle jika nomor telepon tidak ada di URL
    }
    const code = await this.whatsappService.sendVerificationCode(phoneNumber);
    return { success: true, message: 'Verification code sent.', code };
  }

  @Get('/send')
  async send(@Query('target') target: string, @Query('text') text: string) {
    if (!target) {
      // Handle jika nomor telepon tidak ada di URL
    }
    const code = await this.whatsappService.sendMessage(target, text);
    return { success: true, message: 'Verification code sent.', code };
  }
}
