import * as Discord from 'discord.js';
import EasyTable = require('easy-table');

import { MessageCommand, onMessage } from '../bot-event';
import { GetCharacterInfo } from '../web-api';

@onMessage('!캐릭터')
export default class CharacterCommand implements MessageCommand {
  async on(message: Discord.Message) {
    const params = message.content.split(' ');
    if (params.length < 2) {
      message.channel.send(`!캐릭터 (캐릭터 이름) 형식으로 말씀해주시겠어요?`);
      return;
    }

    await GetCharacterInfo(params[1])
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

        message.channel.send(text);
      }).catch((e) => {
        message.channel.send(`'${params[1]}'요? 처음 듣는 이름이에요.`);
        console.log(e);
      })
  }
}

