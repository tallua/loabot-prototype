import * as Discord from 'discord.js';
import { createCommands, MessageCommand } from './bot-event';
import './command';


export class Bot {
  readonly client: Discord.Client;
  commands: { [tag: string]: MessageCommand };

  constructor() {
    this.client = new Discord.Client();
    this.commands = {};

  }

  loadCommands() {
    console.log(`using test command`);
    this.client.on('ready', () => {
      console.info(`Logged in as ${this.client.user.tag}!`);
    })

    this.client.on('message', (message) => {
      const text = message.content;
      console.log(`message written: ${text}`);
      const tag = text.split(' ')[0];

      if (this.commands[tag] !== undefined) {
        this.commands[tag].on(message);
      }
    });

    this.commands = createCommands();
  }

  start(token: string) {
    console.log(`token is ${token}`);
    this.client.login(token);
  }

}
