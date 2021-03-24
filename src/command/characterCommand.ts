import * as Discord from 'discord.js';
import { MessageCommand, onMessage } from '../bot-event';
import { GrabLostarkCharacterPage } from '../web_utils';

import { JSDOM } from 'jsdom';

@onMessage('!character')
@onMessage('!캐릭터')
export default class characterCommand implements MessageCommand {
  async on(message: Discord.Message) {
    const params = message.content.split(' ');
    if (params.length < 2) {
      message.channel.send(`no character name provided`);
      return;
    }

    await GrabLostarkCharacterPage(params[1])
      .then((data) => {
        const dom = new JSDOM(data);
        const elem = dom.window.document.querySelector('.level-info__expedition');

        message.channel.send(`${elem.textContent}`);
      }).catch((e) => {
        message.channel.send(`failed to get data of ${params[1]}`);
        console.log(e);
      })

  }
}

