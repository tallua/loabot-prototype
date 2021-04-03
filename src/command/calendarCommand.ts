import * as Discord from 'discord.js';
import { JSDOM } from 'jsdom';
import { MessageCommand, onMessage } from '../bot-event';
import { GrabInvenTimerPage } from '../web_utils';
import EasyTable = require('easy-table');
import dateformat = require('dateformat');


interface BossEvent {
  name: string;
  remain: string;
  start: string;
};

function extractBossEventList(doc: Document): BossEvent[] {
  const listElement = Array.from(doc.querySelector('.bossList-wrap ul').children);
  return listElement.map((elem) => {
    return {
      name: elem.querySelector('.npcname').textContent,
      remain: elem.querySelector('.remind').textContent,
      start: elem.querySelector('.gentime').textContent,
    };
  });
}


@onMessage('!timer')
@onMessage('!시간표')
export default class CalendarCommand implements MessageCommand {
  async on(message: Discord.Message) {
    await GrabInvenTimerPage()
      .then((data) => {
        const dom = new JSDOM(data);
        const eventsByTime: { [time: string]: BossEvent[] } = {};
        const events = extractBossEventList(dom.window.document);
        events.forEach((e) => {
          if (eventsByTime[e.start] === undefined)
            eventsByTime[e.start] = [];
          eventsByTime[e.start].push(e);
        });

        const table = new EasyTable;
        Object.entries(eventsByTime)
          .slice(0, 10)
          .forEach(([time, eventList]) => {
            table.cell('시간', dateformat(Date.parse(time), 'HH:MM'))
            table.cell('활동', `${eventList.map((e) => `${e.name}`).join(', ')}`)
            table.newRow();
          });

        console.log(table.toString());

        let text = '';

        text += '```md\n';
        text += `#시간표: ${dateformat(Date.now(), 'mm/dd - HH:MM')}\n`;
        text += table.toString();
        text += '```';

        message.channel.send(text);
      })
      .catch((e) => {
        message.channel.send(`failed to get calendar data`);
      })
  }
}
