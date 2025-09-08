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
    await this.whatsappService.sendVerificationCode(phoneNumber);
    return { success: true, message: 'Verification code sent.' };
  }
}
