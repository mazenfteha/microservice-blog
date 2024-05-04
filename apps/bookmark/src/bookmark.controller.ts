import { Controller, Get } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';

@Controller()
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Get()
  getHello(): string {
    return this.bookmarkService.getHello();
  }
}
