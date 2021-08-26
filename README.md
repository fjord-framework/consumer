<p align="center">
  <img src="./readme_materials/fjord.svg" width="500" height="200" />
</p>

# Fjord Consumer

## What is the Fjord Consumer?

The Fjord Consumer is an abstraction for a Kafka consumer group, where each member is a process that attaches to a Kafka cluster, consumes records from one or more topics, and publishes consumed data to a Redis Channel. You can deploy with any number of consumers in your consumer group. The Fjord Consumer is built to be used alongside the Fjord server, which subscribes to a Redis channel and pushes the published Kafka records to subscribed, connected clients.

## How is the Fjord Consumer Deployed?

It's possible to run the Fjord Consumer locally. However, the dockerized consumer is generally intended to be deployed with the entire Fjord infrastructure on AWS, which can be done without using any code in this repo. If you'd like to deploy the entire Fjord infrastructure on AWS using the Fjord CLI, please see the [cli repo](https://github.com/fjord-framework/cli). If you wish to test the consumer locally, please continue reading below.

## How is the Fjord Consumer Run Locally?

### Prerequisites

#### Kafka

Before running the Fjord Consumer, it's necessary to have at minimum a Kafka cluster consisting of a running ZooKeeper server and Kafka broker. This could be running locally or remotely.

If you don't have a cluster, you can clone and use Wurstmeister's `kafka-docker` [repo](https://github.com/wurstmeister/kafka-docker) or simply follow Apache Kafka's [Quickstart instructions](https://kafka.apache.org/quickstart).

#### Redis

It's also necessary to install and run Redis when running the consumer locally. To do so, you can use the official Docker [image](https://hub.docker.com/_/redis/) or follow Redis's [Quickstart instructions](https://redis.io/topics/quickstart). Make sure Redis is running prior to continuing.

#### Fjord Server

If you're running a complete local setup of all Fjord components, you should already have the Fjord server running by this point as well, so that when Redis receives new records, the server will be able to subscribe and receive them. Please see the [server](https://github.com/fjord-framework/server) repo and follow the instructions there if you have not done so already.

### Installation Steps

1. `git clone https://github.com/fjord-framework/consumer.git`
2. `cd consumer`
3. `touch .env`

In your `.env` file, specify the following variables appropriately. If your cluster doesn't implement authentication, you can omit `KAFKA_USERNAME`, `KAFKA_PASSWORD`, and `SECURITY`.

```
CLIENT=Fjord
BROKERS=localhost:9092
KAFKA_TOPICS=stocks
API_TOPICS=stocks
FROM_BEGINNINGS=false
CONCURRENT_PARTITIONS=1
STARTING_DELAY_SEC=0
CONSUMER_GROUP=stocks_group
REDIS_HOST=localhost
REDIS_PORT=6379
SECURITY=
KAFKA_USERNAME=
KAFKA_PASSWORD=
```

`localhost:9092` should work whether you're following Kafka's Quickstart instructions or using Wurstmeister's `kafka-docker` repo. If you know your broker is running on a different socket, please use that.

`FROM_BEGINNINGS` should take one or more space-separated strings `true` or `false`, depending on the number of Kafka consumers in your consumer group. This envrionment variable determines whether each consumer will read from the earliest Kafka offset. If `false`, the consumer will read from the latest offset. Each space-separated string corresponds to one member in the consumer group.

`CONCURRENT_PARTITIONS` allows each Kafka consumer to process several messages at once. This provides a performance optimization for the consumer. If not specified, the default value is `1`, which means messages will not be processed concurrently.

`STARTING_SEC_DELAY` can be specified to add a period of time before which the consumer will not consume new records. If not specified, the consumer will begin consuming records immediately.

#### KAFKA_TOPICS and API_TOPICS

`KAFKA_TOPICS` allows you to specify the Kafka topics from which you want the consumer group to pull records. This could be a single topic, or a _space-delimited list of single-word topics_ if you want the consumer to pull records from more than one topic.

`API_TOPICS` allows you to specify one or more API topics. These are the topics that you wish to expose in client-side code. If you omit `API_TOPICS`, the same Kafka topics that you specify with `KAFKA_TOPICS` will be accesible in the client-side code.

Some examples with different Kafka/API topic configurations:

```
KAFKA_TOPICS=toronto_weather seattle_weather
API_TOPICS=weather weather
```

Here, the Kafka topics `toronto_weather` and `seattle_weather` are both accessible in client-side code via `weather`.

```
KAFKA_TOPICS=toronto_weather seattle_weather
API_TOPICS=weather
```

Here, the Kafka topic `toronto_weather` is accessible as `weather`, and `seattle_weather` is accessible as `seattle_weather`. That is, if you provide a second variable for `KAFKA_TOPICS`, and only one variable for `API_TOPICS`, the additional Kafka topic will be accessible by its Kafka topic identifier.

```
KAFKA_TOPICS=toronto_weather
API_TOPICS=weather wind_speed precipitation
```

Here, `toronto_weather` is accessible as `weather`, and additional API topics are ignored.

4. From the `consumer/` directory, enter `node source.js`. You should see something like the output below, confirming that a new consumer has joined the group.

```
>> node source.js
{"level":"INFO","timestamp":"2021-08-05T17:30:36.550Z","logger":"kafkajs","message":"[Consumer] Starting","groupId":"stocks_group"}
{"level":"INFO","timestamp":"2021-08-05T17:30:36.711Z","logger":"kafkajs","message":"[ConsumerGroup] Consumer has joined the group","groupId":"stocks_group","memberId":"Fjord-24d2cc14-e74b-4578-ab5f-7fad03528aac","leaderId":"Fjord-24d2cc14-e74b-4578-ab5f-7fad03528aac","isLeader":true,"memberAssignment":{"stocks":[0]},"groupProtocol":"RoundRobinAssigner","duration":45}
```

## Next Steps

Congratulations! Your Fjord Consumer is now running locally and is attached to your Kafka cluster, ready to consume any incoming message, which it will then publish to Redis. A good next step to continue with Fjord locally is to clone the example `client` repo and open it in a browser. Please see the [client](https://github.com/fjord-framework/client) repo for further instructions.

## Docker location

https://hub.docker.com/r/fjordframework/consumer
