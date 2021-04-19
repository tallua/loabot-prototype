import * as express from 'express';
import * as bodyParser from 'body-parser';
import { createServer, Server } from 'https';

import { createCommands, MessageCommand } from './bot-event';
import './command';

const nacl = require('tweetnacl');

// Your public key can be found on your application in the Developer Portal
const PUBLIC_KEY = 'APPLICATION_PUBLIC_KEY';


export class Bot {
  server: Server;
  app: express.Application;

  constructor() {
    const bodyParser = require('body-parser');

    this.app = express();
    this.app.use(bodyParser);

    this.app.post(`/message/ping`, (req, res) => {
      console.log(`ping message from server`);
      res.send({
        type: 1
      });
    });
  }

  loadCommands() {
    console.log(`using test command`);

    let commands = createCommands();

    Object.entries(commands).forEach(([url, command]) => {
      this.app.post(`/command/${url}`, (req, res) => {

        const signature = req.get('X-Signature-Ed25519');
        const timestamp = req.get('X-Signature-Timestamp');
        const body = req.rawBody; // rawBody is expected to be a string, not raw bytes

        const isVerified = nacl.sign.detached.verify(
          Buffer.from(timestamp + body),
          Buffer.from(signature, 'hex'),
          Buffer.from(PUBLIC_KEY, 'hex')
        );

        if (!isVerified) {
          return res.status(401).end('invalid request signature');
        }

        command.on(req, res);
      });
    });
  }

  start(port: string) {
    this.server = createServer(this.app);
    this.server.listen(port, () => {
      console.log(`server listeneing to port ${port}`);
    });
  }

}
