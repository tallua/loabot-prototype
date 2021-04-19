import { Request, Response } from 'express';
import EasyTable = require('easy-table');

import { AsyncMessageCommand, onMessage } from '../bot-event';
import { GetMarketInfo } from '../web-api'

const gradeMap = {
  '0': '일반',
  '1': '고급',
  '2': '희귀',
  '3': '영웅',
  '4': '전설',
  '5': '유물',
}

@onMessage('market')
export class MarketCommand extends AsyncMessageCommand {
  async onRequest(req: Request): Promise<string> {
    const options = req.body.data.options as any [];
    if (options.length < 2) {
      return Promise.resolve(`!거래소 (아이템 이름) 형식으로 말씀해주시겠어요?`);
    }

    const itemName = options[0].name;
    await GetMarketInfo({ name: itemName })
      .then((info) => {
        if (info.items.length === 0)
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

        return text;
      }).catch((e) => {
        console.log(e);
        return `'${itemName}'는 어떤 물건인가요?`;
      })
  }
}





