import * as Discord from 'discord.js';
import { JSDOM } from 'jsdom';
import { MessageCommand, onMessage } from '../bot-event';
import { GrabInvenTimerPage } from '../web_utils';


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
export default class calendarCommand implements MessageCommand {
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

        eventsByTime

        let text = '';

        text += '```';
        text += Object.entries(eventsByTime)
          .map(([time, eventList]) => { return `${time}: ${eventList.map((e) => `${e.name}`).join(', ')}` })
          .join('\n');
        text += '```';

        message.channel.send(text);
      })
      .catch((e) => {
        message.channel.send(`failed to get calendar data`);
      })
  }
}
