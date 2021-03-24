import * as Discord from 'discord.js';
import { MessageCommand, onMessage } from '../bot-event';
import { GrabLostarkCharacterPage } from '../web_utils';

import { JSDOM } from 'jsdom';

interface CharacterStat {
  expeditionLevel: string;
  characterLevel: string;
  itemLevel: string;
};

function extractCharacterStat(doc: Document): CharacterStat {
  const expeditionLevel = doc.querySelector('.level-info__expedition').children[1].textContent;
  const characterLevel = doc.querySelector('.level-info__item').children[1].textContent;
  const itemLevel = doc.querySelector('.level-info2__expedition').children[1].textContent;

  return {
    expeditionLevel,
    characterLevel,
    itemLevel
  };
}
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
        const stat = extractCharacterStat(dom.window.document);

        message.channel.send(`\`\`\`이름: ${params[1]}\n캐릭터: ${stat.characterLevel}\n아이템: ${stat.itemLevel}\n원정대: ${stat.expeditionLevel}\`\`\``);
      }).catch((e) => {
        message.channel.send(`failed to get data of ${params[1]}`);
        console.log(e);
      })

  }
}

