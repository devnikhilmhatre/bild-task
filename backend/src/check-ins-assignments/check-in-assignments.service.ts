import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DynamoDBService } from '../dynamodb/dynamodb.service';
import { AssignCheckInDto } from './dto/assign-check-in.dto';
import { SubmitCheckInResponseDto } from './dto/submit-check-in-response.dto';
import { CheckInAssignment } from './entities/check-in-assignment.entity';
import { chunk } from 'lodash';

import {
  BatchWriteCommand,
  QueryCommand,
  QueryCommandInput,
  GetCommandInput,
  GetCommand,
  UpdateCommandInput,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

@Injectable()
export class CheckInAssignmentsService {
  private readonly tableName = 'CheckInAssignments';

  constructor(private readonly dynamoDBService: DynamoDBService) {}

  private client() {
    return this.dynamoDBService.getClient;
  }

  async assignCheckIn(
    checkInId: string,
    dto: AssignCheckInDto,
  ): Promise<{ checkInId: string; assignedTo: string[] }> {
    if (dto.memberEmails.length > 1000) {
      throw new BadRequestException(
        'Cannot assign more than 1000 members at once',
      );
    }

    const assignedAt = new Date().toISOString();

    const items = dto.memberEmails.map((email) => ({
      PutRequest: {
        Item: {
          checkInId,
          memberEmail: email,
          status: 'pending',
          assignedAt,
        },
      },
    }));

    const batches = chunk(items, 25);

    for (const batch of batches) {
      const params = {
        RequestItems: {
          [this.tableName]: batch,
        },
      };

      await this.client().send(new BatchWriteCommand(params));
    }

    return { checkInId, assignedTo: dto.memberEmails };
  }

  async getAssignmentsForMember(
    memberEmail: string,
    limit = 10,
    lastKey?: string,
  ) {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: 'MemberEmailIndex',
      KeyConditionExpression: 'memberEmail = :email',
      ExpressionAttributeValues: { ':email': memberEmail },
      Limit: limit,
    };

    if (lastKey) {
      params.ExclusiveStartKey = { memberEmail, checkInId: lastKey };
    }

    const result = await this.client().send(new QueryCommand(params));

    return {
      items: result.Items as CheckInAssignment[],
      nextKey: result.LastEvaluatedKey
        ? result.LastEvaluatedKey.checkInId
        : undefined,
    };
  }

  async submitResponse(
    checkInId: string,
    memberEmail: string,
    dto: SubmitCheckInResponseDto,
  ) {
    const submittedAt = new Date().toISOString();

    const params: GetCommandInput = {
      TableName: this.tableName,
      Key: { checkInId, memberEmail },
    };

    const existing = await this.client().send(new GetCommand(params));

    if (!existing.Item) {
      throw new NotFoundException(
        `Assignment not found for member ${memberEmail}`,
      );
    }

    const updateParams: UpdateCommandInput = {
      TableName: this.tableName,
      Key: { checkInId, memberEmail },
      UpdateExpression: 'set #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'submitted',
      },
      ReturnValues: 'ALL_NEW',
    };

    await this.client().send(new UpdateCommand(updateParams));
    return { checkInId, memberEmail, status: 'submitted' };
  }
}
