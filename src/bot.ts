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
    let botid = '';
    this.client.on('ready', () => {
      botid = this.client.user.id;
      console.info(`Logged in as ${this.client.user.tag}[${botid}]!`);
    })

    this.client.on('message', (message) => {
      if(message.author.id === botid) {
        return;
      }

      const text = message.content;
      const tag = text.split(' ')[0];

      if (this.commands[tag] !== undefined) {
        console.log(`command: ${message.author.username}@${message.guild.name}.${message.channel.id} : ${text}`);
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
