import { Injectable } from '@nestjs/common';

@Injectable()
export class BookmarkService {
  getHello(): string {
    return 'Hello World!';
  }
}
