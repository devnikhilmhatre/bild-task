import { Module } from '@nestjs/common';
import { DynamoDBService } from './dynamodb.service';

@Module({
  providers: [DynamoDBService]
})
export class DynamoDBModule { }
