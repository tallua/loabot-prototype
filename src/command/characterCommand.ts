import * as Discord from 'discord.js';
import { MessageCommand, onMessage } from '../bot-event';
import { GrabLostarkCharacterPage } from '../web_utils';

import { JSDOM } from 'jsdom';
import EasyTable = require('easy-table');

interface CharacterStat {
  characterName: string;
  serverName: string;
  guildName: string;
  jobName: string;
  territoryName: string;

  expeditionLevel: string;
  characterLevel: string;
  itemLevel: string;
  territoryLevel: string;

  attackPoint: string;
  healthPoint: string;

  fatalityPoint: string;
  masteryPoint: string;
  overpoweringPoint: string;
  quicknessPoint: string;
  patiencePoint: string;
  skillfulPoint: string;

  imprints: string[];
};

function extractCharacterStat(doc: Document): CharacterStat {
  const characterName = doc.querySelector('.profile-character-info__name').getAttribute('title');
  const serverName = doc.querySelector('.profile-character-info__server').getAttribute('title').substr(1);
  const guildName = doc.querySelector('.game-info__guild span:nth-child(2)').textContent;
  const jobName = doc.querySelector('.profile-equipment__character img').getAttribute('alt');
  const territoryName = doc.querySelector('.game-info__wisdom span:nth-child(3)').textContent;

  const expeditionLevel = doc.querySelector('.level-info__expedition span:nth-child(2) small')?.nextSibling.textContent;
  const characterLevel = doc.querySelector('.level-info__item span:nth-child(2) small')?.nextSibling.textContent;
  const itemLevel = doc.querySelector('.level-info2__expedition span:nth-child(2) small')?.nextSibling.textContent;
  const territoryLevel = doc.querySelector('.game-info__wisdom span:nth-child(2) small')?.nextSibling.textContent;

  const attackPoint = doc.querySelector('.profile-ability-basic ul li:nth-child(1) span:nth-child(2)').textContent;
  const healthPoint = doc.querySelector('.profile-ability-basic ul li:nth-child(2) span:nth-child(2)').textContent;

  const fatalityPoint = doc.querySelector('.profile-ability-battle ul li:nth-child(1) span:nth-child(2)').textContent;
  const masteryPoint = doc.querySelector('.profile-ability-battle ul li:nth-child(2) span:nth-child(2)').textContent;
  const overpoweringPoint = doc.querySelector('.profile-ability-battle ul li:nth-child(3) span:nth-child(2)').textContent;
  const quicknessPoint = doc.querySelector('.profile-ability-battle ul li:nth-child(4) span:nth-child(2)').textContent;
  const patiencePoint = doc.querySelector('.profile-ability-battle ul li:nth-child(5) span:nth-child(2)').textContent;
  const skillfulPoint = doc.querySelector('.profile-ability-battle ul li:nth-child(6) span:nth-child(2)').textContent;

  const imprints: string[] = [];
  doc.querySelectorAll('.profile-ability-engrave div div.swiper-wrapper li').forEach((value) => { imprints.push(value.querySelector('span').textContent); })

  return {
    characterName: characterName ? characterName : '-',
    serverName: serverName ? serverName : '-',
    guildName: guildName ? guildName : '-',
    jobName: jobName ? jobName : '-',
    territoryName: territoryName ? territoryName : '-',
    expeditionLevel: expeditionLevel ? expeditionLevel : '-',
    characterLevel: characterLevel ? characterLevel : '-',
    itemLevel: itemLevel ? itemLevel : '-',
    territoryLevel: territoryLevel ? territoryLevel : '-',
    attackPoint: attackPoint ? attackPoint : '-',
    healthPoint: healthPoint ? healthPoint : '-',
    fatalityPoint: fatalityPoint ? fatalityPoint : '-',
    masteryPoint: masteryPoint ? masteryPoint : '-',
    overpoweringPoint: overpoweringPoint ? overpoweringPoint : '-',
    quicknessPoint: quicknessPoint ? quicknessPoint : '-',
    patiencePoint: patiencePoint ? patiencePoint : '-',
    skillfulPoint: skillfulPoint ? skillfulPoint : '-',
    imprints
  };
}
@onMessage('!character')
@onMessage('!캐릭터')
export default class CharacterCommand implements MessageCommand {
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

        const nameTable = new EasyTable;
        nameTable.cell('이름', stat.characterName);
        nameTable.cell('서버', stat.serverName);
        nameTable.cell('직업', stat.jobName);
        nameTable.cell('길드', stat.guildName);
        nameTable.newRow();

        const levelTable = new EasyTable;
        levelTable.cell('캐릭터', stat.characterLevel);
        levelTable.cell('아이템', stat.itemLevel);
        levelTable.cell('원정대', stat.expeditionLevel);
        levelTable.cell('영지', stat.territoryLevel);
        levelTable.newRow();

        const powerTable = new EasyTable;
        powerTable.cell('특성 1', '치명');
        powerTable.cell('수치 1', stat.fatalityPoint);
        powerTable.cell('특성 2', '특화');
        powerTable.cell('수치 2', stat.masteryPoint);
        powerTable.cell('특성 3', '신속');
        powerTable.cell('수치 3', stat.quicknessPoint);
        powerTable.newRow();
        powerTable.cell('특성 1', '제압');
        powerTable.cell('수치 1', stat.overpoweringPoint);
        powerTable.cell('특성 2', '숙련');
        powerTable.cell('수치 2', stat.skillfulPoint);
        powerTable.cell('특성 3', '인내');
        powerTable.cell('수치 3', stat.patiencePoint);
        powerTable.newRow();

        let text = '';
        text += '```md\n';
        text += '#캐릭터\n';
        text += nameTable.toString();
        text += `\n`;
        text += `#레벨\n`;
        text += levelTable.toString();
        text += `\n`;
        text += `#특성\n`;
        text += powerTable.toString();
        text += `\n`;
        text += `#각인\n`;
        text += `${stat.imprints.join('\n')}`;
        text += '```';

        message.channel.send(text);
      }).catch((e) => {
        message.channel.send(`failed to get data of ${params[1]}`);
        console.log(e);
      })

  }
}

