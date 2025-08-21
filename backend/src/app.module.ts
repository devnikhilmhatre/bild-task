import { Module } from '@nestjs/common';
import { DynamoDBModule } from './dynamodb/dynamodb.module';
import { ConfigModule } from '@nestjs/config';

import { CheckInsModule } from './check-ins/check-ins.module';
import { UsersModule } from './users/users.module';
import { OrgModule } from './org/org.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from './cache/cache.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DynamoDBModule,
    CheckInsModule,
    UsersModule,
    OrgModule,
    AuthModule,
    CacheModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
