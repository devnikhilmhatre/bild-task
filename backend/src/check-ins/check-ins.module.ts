import { Module } from '@nestjs/common';
import { CheckInsService } from './check-ins.service';
import { CheckInsController } from './check-ins.controller';
import { DynamoDBModule } from './../dynamodb/dynamodb.module';
import { OrgModule } from './../org/org.module';
import { CacheModule } from './../cache/cache.module';
import { OrgGuard } from '../auth/guards/org.guard';

@Module({
  imports: [DynamoDBModule, OrgModule, CacheModule],
  controllers: [CheckInsController],
  providers: [CheckInsService, OrgGuard],
})
export class CheckInsModule {}
