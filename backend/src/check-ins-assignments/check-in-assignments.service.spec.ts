import { Test, TestingModule } from '@nestjs/testing';
import { CheckInsAssignmentsService } from './check-ins-assignments.service';

describe('CheckInsAssignmentsService', () => {
  let service: CheckInsAssignmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheckInsAssignmentsService],
    }).compile();

    service = module.get<CheckInsAssignmentsService>(CheckInsAssignmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
