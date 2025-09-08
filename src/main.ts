
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WinstonLogger } from './winston.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonLogger
  });

  app.useLogger(WinstonLogger);

  const config = new DocumentBuilder()
    .setTitle('Panara Simple WhatsApp API')
    .setDescription('API sederhana guna menunjang mengirim pesan whatsapp via API')
    .setVersion('0.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
