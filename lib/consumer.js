const { Kafka } = require('kafkajs');

class Consumer {
  constructor(kafka, redis) {
    this.kafka = kafka;
    this.redis = redis;
    const group = { groupId: kafka.consumerGroup};
    this.consumer = new Kafka(kafka.connection).consumer(group);
  }

  async connect() {
    this.consumer.connect();
  }

  async subscribe() {
    this.kafka.topics.forEach((topic, idx) => {
      this.consumer.subscribe({
        topic,
        fromBeginning: !!this.kafka.fromBeginnings[idx]
      });
    });
  }

  async listenAndPublish() {
    let topic, key, value, timestamp;
    const apiConverter = this.kafka.apiConverter;
    const partitionsConsumedConcurrently = this.kafka.concurrentPartitions;

    this.consumer.run({
      partitionsConsumedConcurrently,
      eachMessage: (data) => {
        topic = apiConverter[String(data.topic)];
        key = String(data.message.key);
        value = String(data.message.value);
        timestamp = new Date(Number(data.message.timestamp));
        console.log(`${data.topic} --> key: ${key} | value: ${value} | timestamp: ${timestamp}`);
        const record = JSON.stringify({topic, key, value, timestamp});
        this.redis.publish(record);
      },
    });
  }
}

module.exports = Consumer;