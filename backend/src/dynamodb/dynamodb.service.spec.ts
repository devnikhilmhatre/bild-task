import { Test, TestingModule } from '@nestjs/testing';
import { DynamoDBService } from './dynamodb.service';

describe('DynamodbService', () => {
  let service: DynamoDBService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DynamoDBService],
    }).compile();

    service = module.get<DynamoDBService>(DynamoDBService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
