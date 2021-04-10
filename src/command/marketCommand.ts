import * as Discord from 'discord.js';
import EasyTable = require('easy-table');

import { MessageCommand, onMessage } from '../bot-event';
import { GetMarketInfo } from '../web-api'

const gradeMap = {
  '0': '일반',
  '1': '고급',
  '2': '희귀',
  '3': '영웅',
  '4': '전설',
  '5': '유물',
}

@onMessage('!거래소')
export class MarketCommand implements MessageCommand {
  async on(message: Discord.Message) {
    const params = message.content.split(' ');
    if (params.length < 2) {
      message.channel.send(`no item name provided`);
      return;
    }

    const itemName = params.slice(1).join(' ');
    await GetMarketInfo({name: itemName})
    .then((info) => {
      console.log(info);
      if(info.items.length === 0)
        throw `failed parsing item ${itemName}`;

      const easytable = new EasyTable;

      easytable.separator = '\t';
      info.items.forEach((item) => {
        easytable.cell('이름', item.name);
        easytable.cell('등급', gradeMap[item.grade]);
        easytable.cell('평균가', item.averagePrice);
        easytable.cell('최저가', item.lowestPrice);
        easytable.cell('최근가', item.recentPrice);
        easytable.newRow();
      });

      let text = '';
      text += '```md\n';
      text += `#거래소 검색 결과: ${itemName}\n`;
      text += `${easytable.toString()}`;
      text += '```';

      message.channel.send(text);
    }).catch((e) => {
      message.channel.send(`'${itemName}'는 어떤 물건인가요?`);
      console.log(e);
    })
  }
}





