import amqplib, { Channel, Connection } from "amqplib";
import { queueUrl, vpnServerIP } from "./consts";
import querystring from "node:querystring";
import { spawn } from "node:child_process";
export enum Operation {
  Create = "CREATE",
  Delete = "DELETE",
}
export class Queue {
  name: string;
  connection: Connection;
  channel: Channel;
  constructor() {
    this.name = "vpn";
  }

  async init(): Promise<void> {
    this.connection = await amqplib.connect(queueUrl);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(this.name);
    this.channel.consume(this.name, async (message) => {
      const { username, operation } = querystring.decode(
        message.content.toString()
      );
      console.log(`received ${message.content.toString()}`);
      if (operation === "CREATE") {
        const create = spawn("~/create-client.sh", [username.toString()]);

      }
    });
  }
  async send(username: string, operation: Operation): Promise<void> {
    this.channel.sendToQueue(
      this.name,
      Buffer.from(
        querystring.encode({
          username: username,
          operation: operation,
        })
      )
    );
  }
}
const q = new Queue();
q.init();
export default q;
