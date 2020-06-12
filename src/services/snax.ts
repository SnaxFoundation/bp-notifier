import { JsonRpc } from '@snaxfoundation/snaxjs';
import { take } from 'lodash';
import fetch from 'node-fetch';
import logger from '../logger';
import { config } from '../config';

class Snax {
  public rpc: JsonRpc;

  constructor(chainUrl) {
    this.rpc = new JsonRpc(chainUrl, { fetch });
  }

  public getChainInfo = async () => {
    logger.debug(`Try to get chain info...`);
    const info = await this.rpc.get_info();

    logger.debug(`Got chain info`);

    return info;
  };

  public getTopProducersList = async () => {
    logger.debug(`Try to get top limit...`);

    const topLimits = await this.getTopLimits();

    logger.debug(`Got top limit: ${topLimits}`);

    const { rows } = await this.rpc.get_table_rows({
      json: true,
      code: 'snax',
      scope: 'snax',
      table: 'producers',
      table_key: '',
      lower_bound: '',
      upper_bound: '',
      index_position: 1,
      key_type: '',
      limit: 700,
    });

    const producers = rows
      .filter(({ is_active }) => !!is_active)
      .sort((a, b) => Number(b.total_votes) - Number(a.total_votes));

    return take(producers, topLimits);
  };

  private getTopLimits = async () => {
    const { rows } = await this.rpc.get_table_rows({
      json: true,
      code: 'snax',
      scope: 'snax',
      table: 'global',
      table_key: '',
      lower_bound: '',
      upper_bound: '',
      index_position: 1,
      key_type: '',
      limit: 1,
    });

    const topLimit = rows && rows[0] && rows[0].last_producer_schedule_size;

    if (!topLimit) {
      throw new Error('Can\t take top limit');
    }

    return topLimit;
  };
}

export default new Snax(config.chain.baseUrl);
