import * as https from 'https';
import * as http from 'http';

function grabLostarkSite(path: string): Promise<string> {
  const result = new Promise<string>((resolve, reject) => {
    const host = `lostark.game.onstove.com`;

    const req = https.request({
      host: encodeURI(host),
      path: encodeURI(path)
    }, (res) => {
      var data = '';

      res.on('data', function (chunk) {
        data += chunk;
      });

      res.on('end', function () {
        console.log(`success grab page : ${host}${path}`);
        resolve(data);
      });
    });

    req.on('error', (e) => {
      console.log(`failed grab for page: ${host}${path}`);
      reject(e);
    })
    req.end();
  });

  return result;
}

export async function GrabLostarkCharacterPage(character_name: string): Promise<string> {
  const result = grabLostarkSite(`/Profile/Character/${character_name}`);

  return result;
}
export interface MarketQueryParams {
  name: string;
}

export async function GrabLostarkMarketPage(param: MarketQueryParams) {
  const result = grabLostarkSite(`/Market/GetMarketItemList?` +
    `firstCategory=0&secondCategory=0&characterClass=&tier=0&grade=99&itemName=${param.name}` +
    `&pageSize=10&pageNo=1&isInit=false&sortType=7&_=1616846779410`);

  return result;
}

export async function GrabInvenTimerPage(): Promise<string> {
  const result = new Promise<string>((resolve, reject) => {
    const req = http.request({
      host: `m.inven.co.kr`,
      path: `/lostark/timer/`
    }, (res) => {
      var data = '';

      res.on('data', function (chunk) {
        data += chunk;
      });

      res.on('end', function () {
        console.log(`success grabbing calendar`);
        resolve(data);
      });
    });

    req.on('error', (e) => {
      console.log(`failed requesting calendar`);
      reject(e);
    })
    req.end();
  });

  return result;
}

