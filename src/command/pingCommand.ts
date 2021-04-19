import { Request, Response } from 'express';
import { SyncMessageCommand, onMessage } from '../bot-event';

@onMessage('ping')
export default class PingMessage extends SyncMessageCommand {
  onRequest(): string {
    return '부르셨나요?';
  }
}