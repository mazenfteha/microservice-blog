import { Body, Controller, Get,Delete, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { JwtGuard } from '../../../libs/comman/src/';
import { GetUser } from 'apps/user/src/decorator';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';

@UseGuards(JwtGuard)
@Controller('/api/bookmarks')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Post('create')
  createBookmark(@GetUser('id') userId: number, @Body() dto : CreateBookmarkDto){
    return this.bookmarkService.createBookmark(userId, dto)
  }

  @Get()
  getBookmarks(@GetUser('id') userId: number){
    return this.bookmarkService.getBookmarks(userId)
  }

  @Delete(':id')
  deleteBookmarkById(@GetUser('id') userId: number, @Param('id', ParseIntPipe) bookmarkId: number){
    return this.bookmarkService.deleteBookmarkById(userId, bookmarkId)
  }
}
