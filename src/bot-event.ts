import * as Discord from 'discord.js';
import { on } from 'node:events';

export interface MessageCommand {
    on: (message: Discord.Message) => void
}

interface MessageCommandConstructor {
	new (): MessageCommand;
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
    for(const command of messageCommands) {
        commands[command[0]] = new command[1]();
    }
    return commands;
}

