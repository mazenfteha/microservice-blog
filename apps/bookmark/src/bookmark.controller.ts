import { Controller, Get, UseGuards } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { JwtGuard } from '../../../libs/comman/src/';

@UseGuards(JwtGuard)
@Controller('/api/bookmarks')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Get()
  getHello(): string {
    return this.bookmarkService.getHello();
  }
}
