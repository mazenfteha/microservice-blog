import { Test, TestingModule } from '@nestjs/testing';
import { CommanService } from './comman.service';

describe('CommanService', () => {
  let service: CommanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommanService],
    }).compile();

    service = module.get<CommanService>(CommanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
