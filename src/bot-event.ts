import { Request, Response } from 'express';
import * as https from 'https';

export interface MessageCommand {
  on(req: Request, res: Response): void;
}
export abstract class SyncMessageCommand implements MessageCommand {
  on(req: Request, res: Response) {
    res.send({
      type: 4,
      tts: false,
      content: this.onRequest(req),
      embeds: [],
      allowed_mentions: {
        parse: [],
        roles: [],
        users: [],
        replied_user: false
      },
      flags: 0
    });
  }

  protected abstract onRequest(req: Request): string;
}

export abstract class AsyncMessageCommand implements MessageCommand {
  public on(req: Request, res: Response) {
    res.sendStatus(400);
    //res.send({
    //  type: 5,
    //  tts: false,
    //  content: 'loading...',
    //  embeds: [],
    //  allowed_mentions: {
    //    parse: [],
    //    roles: [],
    //    users: [],
    //    replied_user: false
    //  },
    //  flags: 0
    //});
    //
    //this.onRequest(req).then((content) => {
    //  // TODO
    //});
  }

  protected abstract onRequest(req: Request): Promise<string>;
}

interface MessageCommandConstructor {
  new(): MessageCommand;
}

const messageCommands: [string, MessageCommandConstructor][] = [];

export function onMessage(tag: string) {
  return (target: MessageCommandConstructor) => {
    messageCommands.push([tag, target]);
  };
}

export function createCommands(): { [tag: string]: MessageCommand } {
  console.log(`commands count : ${messageCommands.length}`);

  const commands: { [tag: string]: MessageCommand } = {};
  for (const command of messageCommands) {
    commands[command[0]] = new command[1]();
  }
  return commands;
}

