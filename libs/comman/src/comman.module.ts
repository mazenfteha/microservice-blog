import { Module } from '@nestjs/common';
import { CommanService } from './comman.service';

@Module({
  providers: [CommanService],
  exports: [CommanService],
})
export class CommanModule {}
