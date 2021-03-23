import * as Discord from 'discord.js';

export class Bot {
  readonly client : Discord.Client;

  constructor() {
    this.client = new Discord.Client();

  }

  loadCommands() {
    console.log(`using test command`);
    this.client.on('ready', () => {
      console.info(`Logged in as ${this.client.user.tag}!`);
    })
  }

  start(token: string) {
    console.log(`token is ${token}`);
    this.client.login(token);
  }

}
