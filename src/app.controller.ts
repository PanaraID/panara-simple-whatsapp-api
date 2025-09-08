import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { WhatsappService } from './whatsapp/whatsapp.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('Whatsapp') // Menambahkan tag untuk mengelompokkan endpoint
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly whatsappService: WhatsappService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan pesan sapaan standar' }) // Deskripsi endpoint
  @ApiResponse({
    status: 200,
    description: 'Pesan sapaan berhasil didapatkan.',
    type: String,
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/scan')
  @ApiOperation({
    summary: 'Mengirim kode verifikasi ke nomor telepon',
    description: 'Endpoint ini memulai proses otentikasi dengan mengirim kode verifikasi ke nomor yang dituju.',
  })
  @ApiQuery({
    name: 'phoneNumber',
    required: true,
    description: 'Nomor telepon target (contoh: 6281234567890)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Kode verifikasi berhasil dikirim.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Verification code sent.' },
        code: { type: 'string', example: '123-456' },
      },
    },
  })
  async register(@Query('phoneNumber') phoneNumber: string) {
    const code = await this.whatsappService.sendVerificationCode(phoneNumber);
    return { success: true, message: 'Verification code sent.', code };
  }

  @Get('/send')
  @ApiOperation({
    summary: 'Mengirim pesan teks ke nomor target',
    description: 'Mengirim pesan ke nomor telepon target yang sudah diautentikasi.',
  })
  @ApiQuery({
    name: 'target',
    required: true,
    description: 'Nomor telepon target (contoh: 6281234567890)',
    type: String,
  })
  @ApiQuery({
    name: 'text',
    required: true,
    description: 'Isi pesan yang akan dikirim.',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Pesan berhasil dikirim.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Message sent.' },
        code: { type: 'string', example: '123-456' },
      },
    },
  })
  async send(@Query('target') target: string, @Query('text') text: string) {
    const code = await this.whatsappService.sendMessage(target, text);
    return { success: true, message: 'Message sent.', code };
  }
}
