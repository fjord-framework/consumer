const redis = require('redis');

class Publisher {
  constructor(port, host) {
    this.redis = redis.createClient(port, host);
  }

  publish(record) {
    this.redis.publish('redis', record, this.logReply);
  }

  logReply(err, reply) {
    console.log('redis reply:', reply);
  }  
}

module.exports = Publisher;