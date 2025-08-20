import { Module } from '@nestjs/common';
import { DynamoDBModule } from './dynamodb/dynamodb.module';
import { ConfigModule } from '@nestjs/config';

import { CheckInsModule } from './check-ins/check-ins.module';
import { UsersModule } from './users/users.module';
import { OrgModule } from './org/org.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DynamoDBModule,
    CheckInsModule,
    UsersModule,
    OrgModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
