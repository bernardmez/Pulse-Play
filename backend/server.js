import './src/config/env.js'; // validate env first
import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/utils/logger.js';

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Pulse Play backend started');
});
