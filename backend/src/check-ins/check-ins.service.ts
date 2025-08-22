import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBService } from '../dynamodb/dynamodb.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { UpdateCheckInDto } from './dto/update-check-in.dto';
import { CheckIn } from './entities/check-in.entity';

import {
  GetCommandInput,
  GetCommand,
  PutCommandInput,
  PutCommand,
  ScanCommand,
  ScanCommandInput,
  DeleteCommandInput,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

// Only manager can access this crud
@Injectable()
export class CheckInsService {
  private readonly tableName = 'CheckIns';

  constructor(private readonly dynamoDBService: DynamoDBService) {}

  async create(
    orgId: string | undefined,
    createCheckInDto: CreateCheckInDto,
    email: string,
  ): Promise<CheckIn> {
    if (!orgId) {
      throw new NotFoundException(`Org not found`);
    }

    const checkIn: CheckIn = {
      id: uuidv4(),
      title: createCheckInDto.title,
      dueDate: createCheckInDto.dueDate,
      questions: createCheckInDto.questions,
      createdBy: email,
      ModifiedBy: email,
      createdAt: new Date().toISOString(),
      ModifiedAt: new Date().toISOString(),
      orgId,
    };

    const params: PutCommandInput = {
      TableName: this.tableName,
      Item: checkIn,
    };

    await this.dynamoDBService.getClient.send(new PutCommand(params));

    return checkIn;
  }

  async findAll(
    orgId: string | undefined,
    limit = 10,
    lastKey?: string,
  ): Promise<{ items: CheckIn[]; nextKey?: string }> {
    const params: ScanCommandInput = {
      TableName: this.tableName,
      FilterExpression: 'orgId = :orgId',
      ExpressionAttributeValues: {
        ':orgId': orgId,
      },
      Limit: limit,
    };

    if (lastKey) {
      params.ExclusiveStartKey = { id: lastKey };
    }

    const result = await this.dynamoDBService.getClient.send(
      new ScanCommand(params),
    );

    return {
      items: result.Items as CheckIn[],
      nextKey: result.LastEvaluatedKey ? result.LastEvaluatedKey.id : undefined,
    };
  }

  async findOne(id: string | undefined): Promise<CheckIn> {
    if (!id) {
      throw new NotFoundException(`Check-in ${id} not found`);
    }

    const params: GetCommandInput = {
      TableName: this.tableName,
      Key: { id },
    };

    const result = await this.dynamoDBService.getClient.send(
      new GetCommand(params),
    );

    if (!result.Item) {
      throw new NotFoundException(`Check-in ${id} not found`);
    }
    return result.Item as CheckIn;
  }

  async update(
    id: string | undefined,
    updateCheckInDto: UpdateCheckInDto,
    email: string,
  ): Promise<CheckIn> {
    const existing = await this.findOne(id);

    const updated: CheckIn = {
      ...existing,
      ...updateCheckInDto,
      ModifiedBy: email,
      ModifiedAt: new Date().toISOString(),
    };

    const params: PutCommandInput = {
      TableName: this.tableName,
      Item: updated,
    };

    await this.dynamoDBService.getClient.send(new PutCommand(params));

    return updated;
  }

  async remove(id: string | undefined): Promise<void> {
    await this.findOne(id);

    const params: DeleteCommandInput = {
      TableName: this.tableName,
      Key: { id },
    };
    await this.dynamoDBService.getClient.send(new DeleteCommand(params));
  }
}
