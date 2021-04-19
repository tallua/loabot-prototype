import { Request, Response } from 'express';
import EasyTable = require('easy-table');


import { AsyncMessageCommand, onMessage } from '../bot-event';
import { GetCharacterInfo } from '../web-api';

@onMessage('character')
export default class CharacterCommand extends AsyncMessageCommand {
  async onRequest(req: Request): Promise<string> {
    const options = req.body.data.options as any [];
    if (options.length < 2) {
      return Promise.resolve(`!캐릭터 (캐릭터 이름) 형식으로 말씀해주시겠어요?`);
    }

    const characterName = options[0].name;
    return GetCharacterInfo(characterName)
      .then((info) => {

        const levelTable = new EasyTable;
        levelTable.cell('캐릭터', info.levels.character);
        levelTable.cell('아이템', info.levels.item);
        levelTable.cell('원정대', info.levels.expedition);
        levelTable.cell('영지', info.levels.territory);
        levelTable.newRow();

        const powerTable = new EasyTable;
        powerTable.cell('공격', `${info.stats.attack}`);
        powerTable.cell('체력', `${info.stats.hp}`);
        powerTable.cell('치명', `${info.stats.fatality}`);
        powerTable.cell('특화', `${info.stats.mastery}`);
        powerTable.cell('신속', `${info.stats.quickness}`);
        powerTable.cell('제압', `${info.stats.overpower}`);
        powerTable.cell('숙련', `${info.stats.skillful}`);
        powerTable.cell('인내', `${info.stats.patience}`);
        powerTable.newRow();

        let text = '';
        text += '```md\n';
        text += `#캐릭터: ${info.names.character}[${info.names.job}] @${info.names.server} `;
        text += `${info.names.guild === '-' ? '' : '::' + info.names.guild}\n`;
        text += `\n`;
        text += `* 레벨\n`;
        text += ` ${levelTable.toString().replace(/\n/g, '\n ')}`;
        text += `\n`;
        text += `* 특성\n`;
        text += ` ${powerTable.toString().replace(/\n/g, '\n ')}`;
        text += `\n`;
        text += `* 각인\n`;
        text += `${info.imprints.map(v => ` ${v}`).join('\n')}`;
        text += '```';

        return text;
      }).catch((e) => {
        console.log(e);
        return `'${characterName}'요? 처음 듣는 이름이에요.`;
      })
  }
}

