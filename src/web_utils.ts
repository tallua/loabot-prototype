import * as https from 'https';
import * as http from 'http';

export async function GrabLostarkCharacterPage(character_name: string): Promise<string> {
  const result = new Promise<string>((resolve, reject) => {
    const req = https.request({
      host: `lostark.game.onstove.com`,
      path: encodeURI(`/Profile/Character/${character_name}`)
    }, (res) => {
      var data = '';

      res.on('data', function (chunk) {
        data += chunk;
      });

      res.on('end', function () {
        console.log(`success for character : ${character_name}`);
        resolve(data);
      });
    });

    req.on('error', (e) => {
      console.log(`failed requesting for character : ${character_name}`);
      reject(e);
    })
    req.end();
  });

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