import * as invariant from 'invariant';
import { defaultTo } from 'lodash';
import loadDotenv from './dotenv';

loadDotenv();

invariant(process.env.CHAIN_ENDPOINT, 'CHAIN_ENDPOINT is required');
invariant(
  process.env.NOTIFICATION_WEBHOOK_URL,
  'NOTIFICATION_WEBHOOK_URL is required'
);

invariant(process.env.AUTH_TOKEN, 'AUTH_TOKEN is required');

export const config = {
  chain: {
    baseUrl: process.env.CHAIN_ENDPOINT,
  },
  logger: {
    logLevel: defaultTo(process.env.LOG_LEVEL, 'debug'),
  },
  notifications: {
    webhookUrl: process.env.NOTIFICATION_WEBHOOK_URL,
    beforeAlertTime: defaultTo(Number(process.env.BEFORE_ALERT_TIME), 30),
    producerInTopTime: defaultTo(Number(process.env.PRODUCER_IN_TOP_TIME), 30),
    authToken: process.env.AUTH_TOKEN,
  },
};
