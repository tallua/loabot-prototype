import { config } from 'dotenv';
import { Bot } from './bot';

config();

try {
  const bot = new Bot();

  bot.loadCommands();

  bot.start(process.env.PORT);
} catch (e) {
  console.log(`exception occurred : ${e}`);
}

