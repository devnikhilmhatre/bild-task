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

    await this.dynamoDBService
      .getClient()
      .put({
        TableName: this.tableName,
        Item: user,
      })
      .promise();

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const result = await this.dynamoDBService
      .getClient()
      .get({
        TableName: this.tableName,
        Key: { email },
      })
      .promise();

    if (!result.Item) throw new NotFoundException(`User ${email} not found`);
    return result.Item as User;
  }

  async update(email: string, dto: UpdateUserDto): Promise<User> {
    const existing = await this.findByEmail(email);

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

    await this.dynamoDBService
      .getClient()
      .put({
        TableName: this.tableName,
        Item: updated,
      })
      .promise();

    return updated;
  }

  async remove(email: string): Promise<void> {
    await this.dynamoDBService
      .getClient()
      .delete({
        TableName: this.tableName,
        Key: { email },
      })
      .promise();
  }

  async verifyPassword(email: string, password: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    if (!user) return false;

    return argon2.verify(user.password, password);
  }
}
