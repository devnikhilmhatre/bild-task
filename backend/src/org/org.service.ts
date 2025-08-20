import { Injectable } from '@nestjs/common';
import { DynamoDBService } from '../dynamodb/dynamodb.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrgService {
  private readonly orgsTable = 'Orgs';
  private readonly orgMembersTable = 'OrgMembers';

  constructor(private readonly dynamoDB: DynamoDBService) {}

  private client() {
    return this.dynamoDB.getClient();
  }

  async createOrg(dto: CreateOrgDto, userId: string) {
    const orgId = uuidv4();
    const createdAt = new Date().toISOString();

    await this.client()
      .put({
        TableName: this.orgsTable,
        Item: {
          id: orgId,
          name: dto.name,
          createdBy: userId,
          createdAt,
        },
      })
      .promise();

    await this.client()
      .put({
        TableName: this.orgMembersTable,
        Item: {
          orgId,
          userId,
          role: 'manager',
          joinedAt: createdAt,
        },
      })
      .promise();

    return { orgId, name: dto.name };
  }

  async addMember(orgId: string, dto: AddMemberDto) {
    const joinedAt = new Date().toISOString();

    await this.client()
      .put({
        TableName: this.orgMembersTable,
        Item: {
          orgId,
          email: dto.email,
          role: dto.role,
          joinedAt,
        },
      })
      .promise();

    return { orgId, userId: dto.email, role: dto.role };
  }

  async getMembers(orgId: string) {
    const result = await this.client()
      .query({
        TableName: this.orgMembersTable,
        KeyConditionExpression: 'orgId = :orgId',
        ExpressionAttributeValues: {
          ':orgId': orgId,
        },
      })
      .promise();

    return result.Items || [];
  }

  // async getOrgsOfUser(userId: string) {
  //   const result = await this.client()
  //     .query({
  //       TableName: this.orgMembersTable,
  //       IndexName: 'UserIdIndex',
  //       KeyConditionExpression: 'userId = :userId',
  //       ExpressionAttributeValues: {
  //         ':userId': userId,
  //       },
  //     })
  //     .promise();

  //   return result.Items || [];
  // }
}
