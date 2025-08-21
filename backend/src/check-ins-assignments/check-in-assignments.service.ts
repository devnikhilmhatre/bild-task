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

@Injectable()
export class CheckInAssignmentsService {
  private readonly tableName = 'CheckInAssignments';

  constructor(private readonly dynamoDBService: DynamoDBService) {}

  private client() {
    return this.dynamoDBService.getClient();
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
      await this.client()
        .batchWrite({
          RequestItems: {
            [this.tableName]: batch,
          },
        })
        .promise();
    }

    return { checkInId, assignedTo: dto.memberEmails };
  }

  async getAssignmentsForMember(
    memberEmail: string,
    limit = 10,
    lastKey?: string,
  ) {
    const params: AWS.DynamoDB.DocumentClient.QueryInput = {
      TableName: this.tableName,
      IndexName: 'MemberEmailIndex',
      KeyConditionExpression: 'memberEmail = :email',
      ExpressionAttributeValues: { ':email': memberEmail },
      Limit: limit,
    };

    if (lastKey) {
      params.ExclusiveStartKey = { memberEmail, checkInId: lastKey };
    }

    const result = await this.client().query(params).promise();

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

    const existing = await this.client()
      .get({
        TableName: this.tableName,
        Key: { checkInId, memberEmail },
      })
      .promise();

    if (!existing.Item) {
      throw new NotFoundException(
        `Assignment not found for member ${memberEmail}`,
      );
    }

    await this.client()
      .update({
        TableName: this.tableName,
        Key: { checkInId, memberEmail },
        UpdateExpression:
          'set #status = :submitted, answers = :answers, submittedAt = :submittedAt',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':submitted': 'submitted',
          ':answers': dto.answers,
          ':submittedAt': submittedAt,
        },
      })
      .promise();

    return { checkInId, memberEmail, status: 'submitted' };
  }
}
