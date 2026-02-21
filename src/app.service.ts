import { Injectable } from '@nestjs/common';
import { uptime } from 'os';

@Injectable()
export class AppService {
  getHealth(): string {
    const time = uptime();
    return `System is healthy and up from ${(time / 3600).toFixed(2)} hours.`;
  }
  getHome(): string {
    return `Welcome to task manager app, Happy Learning!`;
  }
}
