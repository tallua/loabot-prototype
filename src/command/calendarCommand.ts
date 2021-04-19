import { Request, Response } from 'express';
import EasyTable = require('easy-table');
import dateformat = require('dateformat');

import { GetCalendar } from '../web-api';
import { AsyncMessageCommand, onMessage } from '../bot-event';


@onMessage('timer')
export default class CalendarCommand extends AsyncMessageCommand {
  async onRequest(): Promise<string> {
    return GetCalendar().then((calendar) => {
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

      return text;
    }).catch((e) => {
      console.log(e);
      return `어라? 여기다가 시간표를 둔 것 같은데...`;
    })
  }
}
