import * as pino from 'pino';
import { config } from './config';

const logger = pino({
  name: 'dynamic-resources',
  level: config.logger.logLevel,
});

export default logger;
