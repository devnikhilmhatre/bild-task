import { Module } from '@nestjs/common';
import { OrgService } from './org.service';
import { OrgController } from './org.controller';
import { DynamoDBModule } from './../dynamodb/dynamodb.module';
import { CacheModule } from './../cache/cache.module';

@Module({
  imports: [DynamoDBModule, CacheModule],
  controllers: [OrgController],
  providers: [OrgService],
  exports: [OrgService],
})
export class OrgModule {}
