import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as argon2 from 'argon2';
import { DynamoDBService } from '../dynamodb/dynamodb.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import {
  PutCommand,
  PutCommandInput,
  GetCommand,
  GetCommandInput,
  DeleteCommandInput,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
@Injectable()
export class UsersService {
  private readonly tableName = 'Users';

  constructor(private readonly dynamoDBService: DynamoDBService) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await argon2.hash(dto.password);

    const user: User = {
      id: uuidv4(),
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };

    const params: PutCommandInput = {
      TableName: this.tableName,
      Item: user,
    };

    await this.dynamoDBService.getClient.send(new PutCommand(params));

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const params: GetCommandInput = {
      TableName: this.tableName,
      Key: { email },
    };
    const result = await this.dynamoDBService.getClient.send(
      new GetCommand(params),
    );

    return (result.Item as User) || null;
  }

  async update(email: string, dto: UpdateUserDto): Promise<User> {
    const existing = await this.findByEmail(email);
    if (!existing) {
      throw new NotFoundException('Not Found');
    }

    let password = existing.password;
    if (dto.password) {
      password = await argon2.hash(dto.password);
    }

    const updated: User = {
      ...existing,
      ...dto,
      password,
      modifiedAt: new Date().toISOString(),
    };

    const params: PutCommandInput = {
      TableName: this.tableName,
      Item: updated,
    };
    await this.dynamoDBService.getClient.send(new PutCommand(params));

    return updated;
  }

  async remove(email: string): Promise<void> {
    const params: DeleteCommandInput = {
      TableName: this.tableName,
      Key: { email },
    };

    await this.dynamoDBService.getClient.send(new DeleteCommand(params));
  }

  async verifyPassword(email: string, password: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    if (!user) return false;

    return argon2.verify(user.password, password);
  }
}
