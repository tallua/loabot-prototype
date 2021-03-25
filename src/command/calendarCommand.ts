import * as Discord from 'discord.js';
import { MessageCommand, onMessage } from '../bot-event';
import { } from '../web_utils';

@onMessage('!timer')
@onMessage('!시간표')
export default class calendarCommand implements MessageCommand {
  on(message: Discord.Message) {
    message.channel.send(`http://m.inven.co.kr/lostark/timer/`);
  }
}
