import * as Discord from 'discord.js';
import { MessageCommand, onMessage, createCommands } from '../bot-event';






@onMessage('!help')
@onMessage('!명령어')
export class HelpCommand implements MessageCommand {
  on(message: Discord.Message) {
    const commandList = Object.entries(createCommands()).map(([tag, executer]) => { return tag; });

    let text = '';
    text += '```';
    text += '사용 가능한 명령어 목록:\n';
    text += `${commandList.join('\n')}`;
    text += '```';

    message.channel.send(text);
  }
}




