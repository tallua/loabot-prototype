import * as webapi from '../web-api';

webapi.GetCharacterInfo('리라아카')
  .then((val) => { console.log(JSON.stringify(val, null, 2)) });




