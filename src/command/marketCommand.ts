import * as Discord from 'discord.js';
import { JSDOM } from 'jsdom';
import { MessageCommand, onMessage } from '../bot-event';
import { GrabLostarkMarketPage } from '../web_utils';

interface ItemStat {
  name: string;
  averagePrice: string;
  recentPrice: string;
  lowestPrice: string;
}

function extractItems(doc: Document) : ItemStat[] {
  const itemListDom = Array.from(doc.body.querySelectorAll('#tbodyItemList tr'));

  return itemListDom.map((elem) => {
    return {
      name: elem.querySelector('td:nth-child(1) div span.name').textContent,
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
      console.log(`<html><head/><body>${data}</body></html>`);
      const dom = new JSDOM(data);

      const items = extractItems(dom.window.document);

      let text = '';
      text += '```';
      text += `거래소 검색 결과: ${itemName}\n`;
      text += `이름 | 평균가 | 최저가 | 최근가\n`;
      text += items.map((val) => { return `${val.name} | ${val.averagePrice} | ${val.lowestPrice} | ${val.recentPrice}`}).join('\n');
      text += '```';

      message.channel.send(text);
    }).catch((e) => {
      message.channel.send(`failed to get market data of ${itemName}`);
      console.log(e);
    })

  }
}





