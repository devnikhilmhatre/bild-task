import { Test, TestingModule } from '@nestjs/testing';
import { CheckInsAssignmentsController } from './check-ins-assignments.controller';
import { CheckInsAssignmentsService } from './check-ins-assignments.service';

describe('CheckInsAssignmentsController', () => {
  let controller: CheckInsAssignmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckInsAssignmentsController],
      providers: [CheckInsAssignmentsService],
    }).compile();

    controller = module.get<CheckInsAssignmentsController>(CheckInsAssignmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
