import * as Discord from 'discord.js';
import { MessageCommand, onMessage } from '../bot-event';

@onMessage('!ping')
export default class PingMessage implements MessageCommand {
  on(message: Discord.Message) {
    message.channel.send('부르셨나요?');
  }
}