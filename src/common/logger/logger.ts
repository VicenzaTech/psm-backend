import { LoggerService } from '@nestjs/common';
import { Logger, createLogger, format, transports } from 'winston';

export class ApplicationLogger implements LoggerService {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      // npm levels: error=0,warn=1,info=2,http=3,verbose=4,debug=5,silly=6
      levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        http: 4,
        verbose: 5,
        debug: 6,
        silly: 7,
      },
      level: 'debug',
      format: format.combine(
        format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
        format.colorize({ all: true }),
        format.printf(({ level, message, timestamp, context }) => {
          const ctx = context ? ` [${context}]` : '';
          return `[PSM-MANAGER] - [${timestamp}] ${level}${ctx}: ${message}`;
        }),
      ),
      transports: [new transports.Console()],
    });
  }

  log(message: string, context?: string): void {
    this.logger.info(message, { context });
  }

  error(message: string, context?: string): void {
    this.logger.error(message, { context });
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context });
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, { context });
  }

  fatal(message: string, context?: string): void {
    this.logger.log('fatal', message, { context });
  }
}
