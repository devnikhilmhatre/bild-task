import { Module } from '@nestjs/common';
import { DynamoDBModule } from './dynamodb/dynamodb.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
import { CheckInsModule } from './check-ins/check-ins.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DynamoDBModule,
    UserModule,
    ProjectModule,
    CheckInsModule,
    UsersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
