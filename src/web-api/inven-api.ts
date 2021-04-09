import * as http from 'http';
import * as cheerio from 'cheerio';

function GrabInvenPage(path: string): Promise<string> {
  const host = 'm.inven.co.kr';
  const result = new Promise<string>((resolve, reject) => {
    const req = http.request({
      host: host,
      path: path
    }, (res) => {
      var data = '';

      res.on('data', function (chunk) {
        data += chunk;
      });

      res.on('end', function () {
        console.log(`success page: ${host}${path}`);
        resolve(data);
      });
    });

    req.on('error', (e) => {
      console.log(`failed grab page: ${host}${path}`);
      reject(e);
    })
    req.end();
  });

  return result;
}

interface BossEvent {
  name: string;
  start: string;
};

export interface CalendarInfo {
  events: BossEvent[]
}

function parseBossEvents(data: string): BossEvent[] {
  const selector = cheerio.load(data);

  const events = selector('.bossList-wrap ul li').toArray().map((val) => {
    return {
      name: selector('.npcname', val).text(),
      start: selector('.gentime', val).text(),
    }
  });

  return events;
}

export function GetCalendar(): Promise<CalendarInfo> {
  const result = GrabInvenPage('/lostark/timer/').then((data) => {
    return {
      events: parseBossEvents(data)
    }
  })

  return result;
}