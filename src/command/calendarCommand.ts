import * as Discord from 'discord.js';
import EasyTable = require('easy-table');
import dateformat = require('dateformat');

import { GetCalendar } from '../web-api';
import { MessageCommand, onMessage } from '../bot-event';


@onMessage('!시간표')
export default class CalendarCommand implements MessageCommand {
  async on(message: Discord.Message) {
    await GetCalendar().then((calendar) => {
      const eventsByTime: { [time: string]: string[] } = {};
      calendar.events.forEach((e) => {
        if (eventsByTime[e.start] === undefined)
          eventsByTime[e.start] = [];
        eventsByTime[e.start].push(e.name);
      });

      const table = new EasyTable;
      Object.entries(eventsByTime)
        .slice(0, 10)
        .forEach(([time, eventList]) => {
          table.cell('시간', dateformat(Date.parse(time), 'HH:MM'))
          table.cell('활동', `${eventList.map((e) => `${e}`).join(', ')}`)
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
        message.channel.send(`어라? 여기다가 시간표를 둔 것 같은데...`);
      })
  }
}
