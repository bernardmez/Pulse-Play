import pino from 'pino';
import { env } from '../config/env.js';

export const logger = pino(
  env.NODE_ENV === 'production'
    ? {}
    : { transport: { target: 'pino-pretty', options: { colorize: true } } }
);
