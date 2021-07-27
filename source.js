require('dotenv').config();
const Config = require('./lib/config');
const Consumer = require('./lib/consumer');

class Source {
  constructor(env) {
    this.config = new Config(env);
    this.consumer = new Consumer(this.config.kafka, this.config.redis);
  }

  async flow() {
    await this.config.delay();
    await this.consumer.connect();
    await this.consumer.subscribe();
    await this.consumer.listenAndPublish();
  }
}

new Source(process.env).flow();