import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channels: { [key: string]: amqp.Channel } = {};
  constructor(private readonly configService: ConfigService) {}


  // Connect to RabbitMQ when the module is initialized
  async onModuleInit() {
    while (this.connection == null) {
      try {
        const env = this.getCurENV();
        let conn_url = 'amqp://localhost:5672';
        if (env === 'production') {
          conn_url = 'amqp://rabbitmq:5672';
        }
        this.connection = await amqp.connect(conn_url);
        this.connection.on('connect', () =>
          console.log('Connected to RabbitMQ'),
        );
        this.connection.on('disconnect', (err) =>
          console.log('Disconnected from RabbitMQ', err),
        );
        console.log('Connected to RabbitMQ');
      } catch (error) {
        console.error(
          'Failed to connect to RabbitMQ, retrying in 5 seconds...',
          error,
        );
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  private getCurENV() {
    return this.configService.get<string>('NODE_ENV');
  }

  async onModuleDestroy() {
    await this.connection.close();
  }

  async createChannel(queue: string): Promise<amqp.Channel> {
    if (!this.channels[queue]) {
      const channel = await this.connection.createChannel();
      await channel.assertQueue(queue, { durable: true });
      this.channels[queue] = channel;
    }
    return this.channels[queue];
  }

  async sendMessage(queue: string, message: string) {
    const channel = await this.createChannel(queue);
    channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
  }

  async consumeMessages(queue: string, callback: (msg: amqp.Message) => void) {
    const channel = await this.createChannel(queue);
    channel.consume(queue, (msg) => {
      if (msg !== null) {
        callback(msg);
        channel.ack(msg);
      }
    });
  }
}
