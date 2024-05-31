import { Body, Controller, Get,Delete, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { JwtGuard } from '../../../libs/comman/src/';
import { GetUser } from 'apps/user/src/decorator';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('bookmarks')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('/api/bookmarks')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @ApiOperation({ summary: 'create bookmark' })
  @ApiResponse({ status: 200, description: 'bookmark created successfully'})
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @Post('create')
  createBookmark(@GetUser('id') userId: number, @Body() dto : CreateBookmarkDto){
    return this.bookmarkService.createBookmark(userId, dto)
  }

  @ApiOperation({ summary: 'get bookmarks' })
  @ApiResponse({ status: 200, description: 'bookmarks retrived successfully'})
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @Get()
  getBookmarks(@GetUser('id') userId: number){
    return this.bookmarkService.getBookmarks(userId)
  }

  @ApiOperation({ summary: 'delete bookmark' })
  @ApiResponse({ status: 200, description: 'bookmark deleted successfully'})
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @Delete(':id')
  deleteBookmarkById(@GetUser('id') userId: number, @Param('id', ParseIntPipe) bookmarkId: number){
    return this.bookmarkService.deleteBookmarkById(userId, bookmarkId)
  }
}
