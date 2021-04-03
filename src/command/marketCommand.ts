import * as Discord from 'discord.js';
import { JSDOM } from 'jsdom';
import { MessageCommand, onMessage } from '../bot-event';
import { GrabLostarkMarketPage } from '../web_utils';
import EasyTable = require('easy-table');

const gradeMap = {
  '0': '일반',
  '1': '고급',
  '2': '희귀',
  '3': '영웅',
  '4': '전설',
  '5': '유물',
}
interface ItemStat {
  name: string;
  grade: string;
  averagePrice: string;
  recentPrice: string;
  lowestPrice: string;
}

function extractItems(doc: Document) : ItemStat[] {
  const itemListDom = Array.from(doc.body.querySelectorAll('#tbodyItemList tr'));

  return itemListDom.map((elem) => {
    return {
      name: elem.querySelector('td:nth-child(1) div span.name').textContent,
      grade: elem.querySelector('.grade').getAttribute('data-grade'),
      averagePrice: elem.querySelector('td:nth-child(2) .price em').textContent,
      recentPrice: elem.querySelector('td:nth-child(3) .price em').textContent,
      lowestPrice: elem.querySelector('td:nth-child(4) .price em').textContent
    }
  });
}

@onMessage('!market')
@onMessage('!거래소')
export class MarketCommand implements MessageCommand {
  async on(message: Discord.Message) {
    const params = message.content.split(' ');
    if (params.length < 2) {
      message.channel.send(`no item name provided`);
      return;
    }

    const itemName = params.slice(1).join(' ');
    await GrabLostarkMarketPage({
      name: itemName
    }).then((data) => {
      const dom = new JSDOM(data);

      const items = extractItems(dom.window.document);
      const easytable = new EasyTable;

      easytable.separator = '\t';
      items.forEach((item) => {
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
      message.channel.send(`failed to get market data of ${itemName}`);
      console.log(e);
    })

  }
}





