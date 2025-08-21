import { Module } from '@nestjs/common';
import { CheckInAssignmentsService } from './check-in-assignments.service';
import { CheckInAssignmentsController } from './check-in-assignments.controller';

@Module({
  controllers: [CheckInAssignmentsController],
  providers: [CheckInAssignmentsService],
})
export class CheckInAssignmentsModule {}
