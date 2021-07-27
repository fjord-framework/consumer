const Publisher = require('./publisher');

class Config {
  constructor(env) {
    this.delayTime = Number(env.STARTING_DELAY_SEC) || 0;
    this.redis = new Publisher(env.REDIS_PORT, env.REDIS_HOST);
    this.initializeKafkaConnection(env);
    this.initializeKafka(env);
  }

  initializeKafkaConnection({
    CLIENT,
    BROKERS,
    SECURITY,
    KAFKA_USERNAME,
    KAFKA_PASSWORD
  }) {
    const connection = {
      clientId: CLIENT,
      brokers: BROKERS.split(" ")
    }
    
    if (SECURITY === 'SASL-plain') {
      connection.sasl = {
        mechanism: 'plain',
        username: KAFKA_USERNAME,
        password: KAFKA_PASSWORD
      }
    }

    this.kafkaConnection = connection;
  }

  initializeKafka({
    KAFKA_TOPICS,
    API_TOPICS,
    FROM_BEGINNINGS,
    CONCURRENT_PARTITIONS,
    CONSUMER_GROUP
  }) {
    
    const topics = KAFKA_TOPICS.split(' ');
    const apiTopics = API_TOPICS.split(' ');
    const apiConverter = topics.reduce((agg, cur, idx) => {
      agg[cur] = (apiTopics[idx] || cur);
      return agg
    }, {});

    this.kafka = {
      connection: this.kafkaConnection,
      topics,
      apiConverter,
      fromBeginnings: FROM_BEGINNINGS.split(' ').map(f => {
        return (f === 'true' || f === 't')
      }),
      concurrentPartitions: (Math.floor(Number(CONCURRENT_PARTITIONS)) || 1),
      consumerGroup: CONSUMER_GROUP
    }
  }

  async delay() {
    if (this.delayTime > 0) {
      console.log(`Starting sleep timer for ${this.delayTime} seconds`);
      await new Promise(r => setTimeout(r, this.delayTime * 1000));
      console.log("end of sleep timer");
    }
  }
}

module.exports = Config;