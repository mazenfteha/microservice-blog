import { Injectable } from '@nestjs/common';

@Injectable()
export class PostService {
  getHello(): string {
    return 'Hello World!';
  }
}
