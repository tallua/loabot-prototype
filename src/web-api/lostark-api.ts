import * as https from 'https';
import * as cheerio from 'cheerio';
import { OutgoingHttpHeaders } from 'node:http';

function getLostarkSite(path: string): Promise<string> {
  const result = new Promise<string>((resolve, reject) => {
    const host = `m-lostark.game.onstove.com`;

    const req = https.request({
      host: encodeURI(host),
      path: encodeURI(path),
      timeout: 3000
    }, (res) => {
      let data = '';

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


function postLostarkSite(path: string, headers: OutgoingHttpHeaders, data: string): Promise<string> {
  const result = new Promise<string>((resolve, reject) => {
    const host = `lostark.game.onstove.com`;

    const req = https.request({
      host: encodeURI(host),
      path: encodeURI(path),
      method: 'POST',
      headers: headers,
      timeout: 3000
    }, (res) => {
      let data = '';

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

    req.write(data);
    req.end();
  });

  return result;
}

interface StatusInfo {
  names: {
    character: string,
    server: string,
    guild: string,
    job: string,
    territory: string
  },
  levels: {
    character: string,
    item: string,
    expedition: string,
    territory: string
  },
  stats: {
    attack,
    hp,
    fatality,
    mastery,
    overpower,
    quickness,
    patience,
    skillful
  },
  imprints: string[]
}

interface GeneralCollectionData {
  index: string;
  name: string;
  complete: boolean;
}

interface MococoCollectionData {
  index: string;
  name: string;
  collected: string;
  total: string;
}

interface CollectionInfo {
  collections: {
    heartOfIsland: GeneralCollectionData[],
    starOfOrpheus: GeneralCollectionData[],
    heartOfGiants: GeneralCollectionData[],
    greatMasterPiece: GeneralCollectionData[],
    adventureStory: GeneralCollectionData[],
    markOfIgnea: GeneralCollectionData[],
    leafOfWorldTree: GeneralCollectionData[],
    mococoSeed: MococoCollectionData[]
  }

}

interface PVPInfo {

}

export interface CharacterInfo extends StatusInfo, CollectionInfo, PVPInfo {
};

interface SessionInfo {
  memberNo: string;
  pcId: string;
  worldNo: string;
  pcName: string;
  pvpLevel: string;
}

function parseSessionInfo(data: string): SessionInfo {

  const memberNo = data.match(/var _memberNo = '(.*)'/gi)[0].split(`'`)[1];
  const pcId = data.match(/var _pcId = '(.*)'/gi)[0].split(`'`)[1];
  const worldNo = data.match(/var _worldNo = '(.*)'/gi)[0].split(`'`)[1];
  const pcName = data.match(/var _pcName = '(.*)'/gi)[0].split(`'`)[1];
  const pvpLevel = data.match(/var _pvpLevel = '(.*)'/gi)[0].split(`'`)[1];

  return {
    memberNo,
    pcId,
    worldNo,
    pcName,
    pvpLevel
  }
}

function format(str, options = { } as { [key: string]: any }) {
  if(str === undefined || str === null || str.length === 0) {
    console.log('asdf');
      return '-';
  }

  if(options.trim) {
      str = str.trim();
  }

  if(options.substr && options.substr != 0) {
    str = str.substr(options.substr);
  }

  return str;
}

function ignore_first(selector) {
  try {
      return selector.children().clone().remove().end().text();
  } catch(e) {
      return null;
  }
}

function parseStatusInfo(data: string): StatusInfo {
  const selector = cheerio.load(data);

  return {
    names: {
      character: format(ignore_first(selector('#myinfo__character--button2')), { trim: true }),
      server: format(selector('.myinfo__character .wrapper-define dl:nth-child(1) dd').text(), { substr: 1 }),
      guild: format(selector('.guild-name').text()),
      job: format(selector('.myinfo__badge img').attr('alt')),
      territory: format(selector('.wisdom span').text())
    },
    levels: {
      character: format(selector('#myinfo__character--button2 span').text(), { substr: 3 }),
      item: format(selector('.myinfo__contents-level .item dd').text()),
      expedition: format(selector('.myinfo__contents-level div:nth-child(1) dl:nth-child(1) dd').text()),
      territory: format(selector('.wisdom dd').clone().children().remove().end().text(), { substr: 3 })
    },
    stats: {
      attack: format(selector('.profile-ability-basic:nth-child(1) li:nth-child(1) span:nth-child(2)').text()),
      hp: format(selector('.profile-ability-basic:nth-child(1) li:nth-child(2) span:nth-child(2)').text()),
      fatality: format(selector('.profile-ability-basic:nth-child(2) li:nth-child(1) span:nth-child(2)').text()),
      mastery: format(selector('.profile-ability-basic:nth-child(2) li:nth-child(2) span:nth-child(2)').text()),
      overpower: format(selector('.profile-ability-basic:nth-child(2) li:nth-child(3) span:nth-child(2)').text()),
      quickness: format(selector('.profile-ability-basic:nth-child(2) li:nth-child(4) span:nth-child(2)').text()),
      patience: format(selector('.profile-ability-basic:nth-child(2) li:nth-child(5) span:nth-child(2)').text()),
      skillful: format(selector('.profile-ability-basic:nth-child(2) li:nth-child(6) span:nth-child(2)').text())
    },
    imprints: selector('.profile-ability-engrave ul li span')
      .toArray()
      .map(val => selector(val))
      .map(val => val.text())
  }
}

function parseCollectionInfo(data: string): CollectionInfo {
  const selector = cheerio.load(data);

  const parseGeneral = (tag: string): GeneralCollectionData[] => {
    return selector(tag)
      .toArray()
      .map(val => selector(val))
      .map(val => {
        return {
          index: val.children().first().text(),
          name: val.clone().children().remove().end().text(),
          complete: val.hasClass('complete')
        }
      });
  }

  const parseMococo = (tag: string): MococoCollectionData[] => {
    return selector(tag)
      .toArray()
      .map(val => selector(val))
      .map(val => {
        return {
          index: val.children().first().text(),
          name: val.clone().children().remove().end().text().trim(),
          collected: selector(val.find('em span:nth-child(1)')).text(),
          total: selector(val.find('em span:nth-child(2)')).text()
        }
      });
  }

  return {
    collections: {
      heartOfIsland: parseGeneral('#lui-tab1-1 .list li'),
      starOfOrpheus: parseGeneral('#lui-tab1-2 .list li'),
      heartOfGiants: parseGeneral('#lui-tab1-3 .list li'),
      greatMasterPiece: parseGeneral('#lui-tab1-4 .list li'),
      adventureStory: parseGeneral('#lui-tab1-6 .list li'),
      markOfIgnea: parseGeneral('#lui-tab1-7 .list li'),
      leafOfWorldTree: parseGeneral('#lui-tab1-8 .list li'),
      mococoSeed: parseMococo('#lui-tab1-5 .list li')
    }
  };
}

function parsePVPInfo(data: string): PVPInfo {
  return {

  };
}

export function GetCharacterInfo(character_name: string): Promise<CharacterInfo> {
  const result = getLostarkSite(`/Profile/Character/${character_name}`)
    .then(statusStr => {
      const session = parseSessionInfo(statusStr);

      return [parseStatusInfo(statusStr), session] as [StatusInfo, SessionInfo];
    })
    .then(([data, session]) => {
      const collectionPostData = `memberNo=${session.memberNo}&worldNo=${session.worldNo}&pcId=${session.pcId}`;
      return postLostarkSite('/Profile/GetCollection', {
        'Accept': 'text/html, */*; q=0.01',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(collectionPostData),
        'Host': 'lostark.game.onstove.com',
        'Origin': 'https://lostark.game.onstove.com',
        'Referer': encodeURI(`https://lostark.game.onstove.com/Profile/Character/${session.pcName}`),
        'X-Requested-With': 'XMLHttpRequest'
      }, collectionPostData)
        .then((collectionStr) => {
          return [{ ...data, ...parseCollectionInfo(collectionStr) }, session] as [StatusInfo & CollectionInfo, SessionInfo];
        })
    })
    .then(([data, session]) => {
      const collosseumPostData = `memberNo=${session.memberNo}&worldNo=${session.worldNo}&pcId=${session.pcId}&pvpLevel=${session.pvpLevel}`;
      return postLostarkSite('/Profile/GetCollosseum', {
        'Accept': 'text/html, */*; q=0.01',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(collosseumPostData),
        'Host': 'lostark.game.onstove.com',
        'Origin': 'https://lostark.game.onstove.com',
        'Referer': encodeURI(`https://lostark.game.onstove.com/Profile/Character/${session.pcName}`),
        'X-Requested-With': 'XMLHttpRequest'
      }, collosseumPostData)
        .then((pvpStr) => {
          return [{ ...data, ...parsePVPInfo(pvpStr) }, session] as [StatusInfo & CollectionInfo & PVPInfo, SessionInfo];
        })
    })
    .then(([data,]) => data);

  return result;
}

interface MarketItemInfo {
  name: string;
  grade: string;
  averagePrice: string;
  recentPrice: string;
  lowestPrice: string;
}

export interface MarketInfo {
  items: MarketItemInfo[]
}

function parseMarketItemInfo(data: string): MarketItemInfo[] {
  const selector = cheerio.load(data);

  if(selector('#tbodyItemList tr').hasClass('empty')) {
    return [];
  }

  const items = selector('#tbodyItemList tr').toArray().map((val) => {
    return {
      name: selector('td:nth-child(1) div span.name', val).text(),
      grade: selector('.grade', val).attr('data-grade'),
      averagePrice: selector('td:nth-child(2) .price em', val).text(),
      recentPrice: selector('td:nth-child(3) .price em', val).text(),
      lowestPrice: selector('td:nth-child(4) .price em', val).text()
    }
  })

  return items;
}


export function GetMarketInfo(params: { name: string }): Promise<MarketInfo> {
  const result = getLostarkSite(`/Market/GetMarketItemList?` +
    `firstCategory=0&secondCategory=0&characterClass=&tier=0&grade=99&itemName=${params.name}` +
    `&pageSize=10&pageNo=1&isInit=false&sortType=7&_=161684677941`)
    .then(data => {
      return {
        items: parseMarketItemInfo(data)
      }
    })

  return result;
}