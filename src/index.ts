import { config } from 'dotenv';
import { Bot } from './bot';

config();

try {
  const bot = new Bot();

  bot.loadCommands(`${__dirname}/command`);

  bot.start(process.env.TOKEN);
} catch (e) {
  console.log(`exception occurred : ${e}`);
}

