import { Module } from '@nestjs/common';
import { BookmarkController } from './bookmark.controller';
import { BookmarkService } from './bookmark.service';

@Module({
  imports: [],
  controllers: [BookmarkController],
  providers: [BookmarkService],
})
export class BookmarkModule {}
