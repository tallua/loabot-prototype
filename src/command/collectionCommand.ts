import * as Discord from 'discord.js';
import EasyTable = require('easy-table');

import { MessageCommand, onMessage } from '../bot-event';
import { GetCharacterInfo } from '../web-api';

interface GeneralCollectionData {
  index: string;
  name: string;
  complete: boolean;
}

interface MococoCollectionData {
  index: string;
  name: string;
  collected: string;
  total: string;
}

function printGeneral(collection: GeneralCollectionData[]): string {
  return collection.map((data) => {
    if (data.complete)
      return `# ${data.index} ${data.name}`
    else
      return `> ${data.index} ${data.name}`;
  }).join('\n');
}

function printLeaf(collection: GeneralCollectionData[]): string {
  const table = new EasyTable;
  table.separator = '|';

  const title = ['고고학', '채집', '벌목', '채광', '수렵', '낚시']
  for(let i = 1; i < collection.length; ++i)
  {
    table.cell(title[i % 6], collection[i].complete ? 'O' : 'X');
    if(i % 6 == 0)
      table.newRow();
  }

  let text = `가이드: [${collection[0].complete ? 'O' : 'X'}]\n`;
  text += table.toString();
  return text;
}

function printMococo(collection: MococoCollectionData[]): string {

  return '';
}


@onMessage('!수집품')
export default class CollectionCommand implements MessageCommand {
  async on(message: Discord.Message) {
    const params = message.content.split(' ');
    if (params.length < 2) {
      message.channel.send(`no character name provided`);
      return;
    }
    else if (params.length < 3) {
      message.channel.send(`no operation provided`);
      return;
    }

    const characterName = params[1];
    const op = params.slice(2).join(' ');
    await GetCharacterInfo(characterName)
      .then((info) => {

        let text = '```md\n';
        text += `# 수집품: ${info.names.character}\n`;
        switch (op) {
          case '섬마':
          case '섬의 마음':
            text += '* 섬의 마음\n';
            text += printGeneral(info.collections.heartOfIsland);
            break;
          case '올페':
          case '오르페우스':
          case '별':
          case '오르페우스의 별':
            text += '* 오르페우스의 별\n';
            text += printGeneral(info.collections.starOfOrpheus);
            break;
          case '거심':
          case '심장':
          case '거인의 심장':
            text += '* 거인의 심장\n';
            text += printGeneral(info.collections.heartOfGiants);
            break;
          case '미술품':
          case '위대한 미술품':
            text += '* 위대한 미술품\n';
            text += printGeneral(info.collections.greatMasterPiece);
            break;
          case '모험물':
          case '항해 모험물':
            text += '* 항해 모험물\n';
            text += printGeneral(info.collections.adventureStory);
            break;
          case '징표':
          case '이그네아':
          case '이그네아의 징표':
            text += '* 이그네아의 징표\n';
            text += printGeneral(info.collections.markOfIgnea);
            break;
          case '세계수':
          case '잎':
          case '세계수의 잎':
            text += '* 세계수의 잎\n';
            text += printLeaf(info.collections.leafOfWorldTree);
            break;
          case '모코코':
          case '모코코의 씨앗':
            text += '* 모코코의 씨앗\n';
            text += printMococo(info.collections.mococoSeed);
            break;
          default:
            throw `unsupported command: ${op}`;
        }
        text += '```';

        message.channel.send(text);
      }).catch((e) => {
        message.channel.send(`'${params[1]}'요? 처음 듣는 이름이에요.`);
        console.log(e);
      })
  }
}

