import winston from 'winston';

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, context }) => {
        const ctx = context ? ` [${context}]` : '';
        return `${timestamp}${ctx} ${level}: ${message}`;
      })
    )
  })
];

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true })
  ),
  transports
});

export function log(context: string, message: string, meta?: Record<string, unknown>): void {
  logger.info(message, { context, ...meta });
}

export function error(context: string, message: string, err?: unknown): void {
  logger.error(message, {
    context,
    err: err instanceof Error ? err.message : err,
    stack: err instanceof Error ? err.stack : undefined
  });
}