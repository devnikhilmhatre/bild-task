import { Module } from '@nestjs/common';
import { CheckInAssignmentsService } from './check-in-assignments.service';
import { CheckInAssignmentsController } from './check-in-assignments.controller';
import { DynamoDBModule } from './../dynamodb/dynamodb.module';
import { OrgModule } from './../org/org.module';
import { CacheModule } from './../cache/cache.module';
import { OrgGuard } from '../auth/guards/org.guard';

@Module({
  imports: [DynamoDBModule, OrgModule, CacheModule],
  controllers: [CheckInAssignmentsController],
  providers: [CheckInAssignmentsService, OrgGuard],
})
export class CheckInAssignmentsModule {}
