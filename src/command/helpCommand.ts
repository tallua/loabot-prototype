import * as Discord from 'discord.js';
import { MessageCommand, onMessage, createCommands } from '../bot-event';






@onMessage('!명령어')
export class HelpCommand implements MessageCommand {
  on(message: Discord.Message) {
    const commandList = Object.entries(createCommands()).map(([tag, executer]) => { return tag; });

    let text = '';
    text += '```';
    text += '아래에 명령어 대해서 답해드릴 수 있어요!\n';
    text += `${commandList.join('\n')}`;
    text += '```';

    message.channel.send(text);
  }
}




