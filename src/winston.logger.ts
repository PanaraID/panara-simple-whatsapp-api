// src/winston.logger.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const WinstonLogger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      level: 'error',
      dirname: 'logs',
      filename: 'error.log',
    }),
    new winston.transports.File({
      level: 'info',
      dirname: 'logs',
      filename: 'info.log',
    }),
  ],
});