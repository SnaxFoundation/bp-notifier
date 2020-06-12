import * as Promise from 'bluebird';
import { CronJob } from 'cron';
import * as moment from 'moment';
import fetch from 'node-fetch';
import mapper from './usersMapper';

import { config } from '../config';
import logger from '../logger';
import snax from './snax';

class ProducersObserver {
  private headBlockMoment;
  private topProducers = [];
  private sentNotificationsSet = new Set();

  public start = () => {
    new CronJob('*/1 * * * *', () => this.job(), null, true, null, null, true);
  };

  private registerTopProducers = async () => {
    try {
      const { head_block_time } = await snax.getChainInfo();

      // check if new head block time is less than current. in this way just ignore the job
      if (
        this.headBlockMoment &&
        moment.utc(head_block_time).diff(this.headBlockMoment, 'ms') < 0
      ) {
        logger.error('Got head block with less block time than before');
        return false;
      }

      this.headBlockMoment = moment.utc(head_block_time);

      const topProducers: any = await snax.getTopProducersList();

      this.topProducers = topProducers;
      return true;
    } catch (error) {
      logger.error(error);
      process.exit(1);
    }
  };

  private checkProducersUptime = async () => {
    logger.debug(`Check all producers for uptime`);

    await Promise.each(
      this.topProducers,
      async ({ owner, last_block_time }) => {
        const lastBlockTime = moment.utc(last_block_time);

        const sinceLastBlockTimeInMinutes = this.headBlockMoment.diff(
          lastBlockTime,
          'minutes'
        );

        const { beforeAlertTime } = config.notifications;

        if (sinceLastBlockTimeInMinutes >= beforeAlertTime) {
          logger.debug(
            `${owner} is not producing blocks for more than ${beforeAlertTime}`
          );

          if (this.sentNotificationsSet.has(owner)) {
            logger.debug(
              `Notification about downtime is already sent to ${owner} `
            );
            return;
          }

          await this.sendNotification(owner);
        } else {
          if (this.sentNotificationsSet.has(owner)) {
            logger.debug(
              `${owner} is become active. Clear notifications map from already sent status.`
            );
            this.sentNotificationsSet.delete(owner);
          }
        }
      }
    );

    logger.debug(`Everyone is checked. Wait for new cron check`);
  };

  private sendNotification = async snaxAccount => {
    const discordAccount = mapper.snaxToDiscord(snaxAccount);
    const id = mapper.snaxToId(snaxAccount);

    const body = JSON.stringify({
      id,
      snaxAccount,
      discordAccount,
    });

    try {
      logger.debug(`Try to send downtime notifications to ${snaxAccount}`);

      const response = await fetch(config.notifications.webhookUrl, {
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': config.notifications.authToken,
        },
        method: 'POST',
        body,
      });

      if (response.status === 202) {
        this.sentNotificationsSet.add(snaxAccount);

        logger.debug(`Notification to ${snaxAccount} was sent`);
      }
    } catch (error) {
      logger.error(error);
    }
  };

  private job = async () => {
    const success = await this.registerTopProducers();

    if (success) {
      await this.checkProducersUptime();
    }
  };
}

export default new ProducersObserver();
