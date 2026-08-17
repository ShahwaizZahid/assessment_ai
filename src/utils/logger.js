import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { redactSensitive } from './redact.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
/** Always mvp_assessment_ai/logs — not process CWD. */
export const LOG_DIR = join(__dirname, '..', '..', 'logs');

mkdirSync(LOG_DIR, { recursive: true });

const useColor =
  process.env.NODE_ENV !== 'production' && Boolean(process.stdout.isTTY);

/**
 * Must mutate and return the same `info` object. Returning a plain clone drops
 * Winston Symbols (e.g. MESSAGE) and silently kills console + file output.
 */
const redactFormat = winston.format((info) => {
  const metaKeys = Object.keys(info).filter(
    (k) => !['level', 'message', 'timestamp', 'stack'].includes(k),
  );
  const meta = {};
  for (const key of metaKeys) {
    meta[key] = info[key];
    delete info[key];
  }
  Object.assign(info, redactSensitive(meta));
  if (typeof info.message === 'object' && info.message !== null) {
    info.message = redactSensitive(info.message);
  }
  return info;
});

const consoleFormats = [winston.format.timestamp(), winston.format.simple()];
if (useColor) {
  consoleFormats.splice(1, 0, winston.format.colorize());
}

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    redactFormat(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(...consoleFormats),
      stderrLevels: [],
    }),
    new DailyRotateFile({
      filename: join(LOG_DIR, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d',
      zippedArchive: true,
      format: winston.format.combine(winston.format.json()),
    }),
    new DailyRotateFile({
      filename: join(LOG_DIR, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      zippedArchive: true,
      format: winston.format.combine(winston.format.json()),
    }),
  ],
});

logger.info('Logger initialized', { logDir: LOG_DIR });

/**
 * ID-only structured action log. Never pass bodies, tokens, or secrets here.
 */
export const logAction = (meta) => {
  const { action, status = 'ok', ...rest } = meta;
  logger.info(action, { action, status, ...rest });
};
