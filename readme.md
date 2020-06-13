# Snax BP notifier

### Installation

#### Node js

1. Clone this repository
2. Install dependencies by running, `yarn` or `npm i`
3. Start `yarn start` or `npm run start`

### Env

`NODE_ENV` - node env(production, development, test)

`CHAIN_ENDPOINT` - snax chain host

`NOTIFICATION_WEBHOOK_URL` - notification webhook url

`BEFORE_ALERT_TIME` - amount of time to wait before send downtime notification. Default to `30` min

`PRODUCER_IN_TOP_TIME` - amount of time producer should be in top. Default to `30` min

`AUTH_TOKEN` - X-Auth-Token auth token

`LOG_LEVEL` - logger level. Default to `debug`
