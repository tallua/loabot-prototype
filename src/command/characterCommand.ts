import * as Discord from 'discord.js';
import { MessageCommand, onMessage } from '../bot-event';
import { GrabLostarkCharacterPage } from '../web_utils';

import { JSDOM } from 'jsdom';

interface CharacterStat {
  characterName: string;
  serverName: string;
  guildName: string;
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
  const territoryName = doc.querySelector('.game-info__wisdom span:nth-child(3)').textContent;

  const expeditionLevel = doc.querySelector('.level-info__expedition span:nth-child(2) small').nextSibling.textContent;
  const characterLevel = doc.querySelector('.level-info__item span:nth-child(2) small').nextSibling.textContent;
  const itemLevel = doc.querySelector('.level-info2__expedition span:nth-child(2) small').nextSibling.textContent;
  const territoryLevel = doc.querySelector('.game-info__wisdom span:nth-child(2) small').nextSibling.textContent;

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
    characterName,
    serverName,
    guildName,
    territoryName,
    expeditionLevel,
    characterLevel,
    itemLevel,
    territoryLevel,
    attackPoint,
    healthPoint,
    fatalityPoint,
    masteryPoint,
    overpoweringPoint,
    quicknessPoint,
    patiencePoint,
    skillfulPoint,
    imprints
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

        var text = '';
        text += '```\n';
        text += `이름: ${stat.characterName}    서버: ${stat.serverName}\n`;
        text += `길드: ${stat.guildName}    영지: ${stat.territoryName}\n`;
        text += `----------------------------------------\n`;
        text += `레벨\n`;
        text += `캐릭터: ${stat.characterLevel}    아이템: ${stat.itemLevel}\n`;
        text += `원정대: ${stat.expeditionLevel}    영지: ${stat.territoryLevel}\n`;
        text += `----------------------------------------\n`;
        text += `특성\n`;
        text += `공격력: ${stat.attackPoint}    체력: ${stat.healthPoint}\n`;
        text += `치명: ${stat.fatalityPoint}    특화: ${stat.masteryPoint}\n`;
        text += `제압: ${stat.overpoweringPoint}    신속: ${stat.quicknessPoint}\n`;
        text += `인내: ${stat.patiencePoint}    숙련: ${stat.skillfulPoint}\n`;
        text += `----------------------------------------\n`;
        text += `각인\n`;
        text += `${stat.imprints.join('\n')}`;
        text += '```';

        message.channel.send(text);
      }).catch((e) => {
        message.channel.send(`failed to get data of ${params[1]}`);
        console.log(e);
      })

  }
}

