import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBService } from '../dynamodb/dynamodb.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { UpdateCheckInDto } from './dto/update-check-in.dto';
import { CheckIn } from './entities/check-in.entity';

// Only manager can access this crud
@Injectable()
export class CheckInsService {
  private readonly tableName = 'CheckIns';

  constructor(private readonly dynamoDBService: DynamoDBService) { }

  async create(createCheckInDto: CreateCheckInDto): Promise<CheckIn> {
    let managerId = "1" // @NOTE: later pick it up from jwt

    const checkIn: CheckIn = {
      id: uuidv4(),
      title: createCheckInDto.title,
      dueDate: createCheckInDto.dueDate,
      questions: createCheckInDto.questions,
      createdBy: managerId,
      ModifiedBy: managerId,
      createdAt: new Date().toISOString(),
      ModifiedAt: new Date().toISOString(),
    };

    await this.dynamoDBService.getClient().put({
      TableName: this.tableName,
      Item: checkIn,
    }).promise();

    return checkIn;
  }

  async findAll(limit = 10, lastKey?: string): Promise<{ items: CheckIn[]; nextKey?: string }> {
    const params: AWS.DynamoDB.DocumentClient.ScanInput = {
      TableName: this.tableName,
      Limit: limit,
    };

    if (lastKey) {
      params.ExclusiveStartKey = { id: lastKey };
    }

    const result = await this.dynamoDBService.getClient().scan(params).promise();

    return {
      items: result.Items as CheckIn[],
      nextKey: result.LastEvaluatedKey ? result.LastEvaluatedKey.id : undefined,
    };
  }

  async findOne(id: string): Promise<CheckIn> {
    const result = await this.dynamoDBService.getClient().get({
      TableName: this.tableName,
      Key: { id },
    }).promise();

    if (!result.Item) {
      throw new NotFoundException(`Check-in ${id} not found`);
    }
    return result.Item as CheckIn;
  }

  async update(id: string, updateCheckInDto: UpdateCheckInDto): Promise<CheckIn> {
    const existing = await this.findOne(id);
    let managerId = "1" // @NOTE: later pick it up from jwt

    const updated: CheckIn = {
      ...existing,
      ...updateCheckInDto,
      ModifiedBy: managerId,
      ModifiedAt: new Date().toISOString(),
    };

    await this.dynamoDBService.getClient().put({
      TableName: this.tableName,
      Item: updated,
    }).promise();

    return updated;
  }

  async remove(id: string): Promise<void> {
    // Check if exists first (for clean 404)
    await this.findOne(id);

    await this.dynamoDBService.getClient().delete({
      TableName: this.tableName,
      Key: { id },
    }).promise();
  }
}
