import * as Discord from 'discord.js';

export class Bot {

  loadCommands(path: string) {
    console.log(`loading commands from ${path}`);
  }

  start(token: string) {
    console.log(`token is ${token}`);
  }

}
