import { Request, Response } from 'express';
import { SyncMessageCommand, onMessage, createCommands } from '../bot-event';

@onMessage('help')
export class HelpCommand extends SyncMessageCommand {
  onRequest(req: Request): string {
    const commandList = Object.entries(createCommands()).map(([tag,]) => { return tag; });

    let text = '';
    text += '```';
    text += '아래에 명령어 대해서 답해드릴 수 있어요!\n';
    text += `${commandList.join('\n')}`;
    text += '```';

    return text;
  }
}




