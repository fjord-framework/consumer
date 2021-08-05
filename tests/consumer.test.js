const Publisher = require('../lib/publisher');
require('dotenv').config();

function mockPublisher() {
  let defaultPublisher = new Publisher();
  require('bluebird').promisifyAll(defaultPublisher);
  return defaultPublisher;
}

let publisher;

beforeAll(done => {
  publisher = mockPublisher().redis;
  done();
});

afterAll(done => {
  publisher.quit();
  done();
});

test('Publisher can be instantiated with default host and port', () => {
  let defaultPublisher = mockPublisher();
  expect(defaultPublisher).toBeInstanceOf(Publisher);
  defaultPublisher.redis.quit();
});

test('Publisher can publish a message to redis', async () => {
  publisher.publish('test', JSON.stringify({testRecord: '1'}));
  await publisher.on('message', (channel, message) => {
    expect(publisher.connected).toBe(true);
    expect(channel).toBe('test');
    expect(message).toBe('{"testRecord":"1"}');
  });
});