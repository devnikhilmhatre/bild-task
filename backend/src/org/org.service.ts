import { Injectable, NotFoundException } from '@nestjs/common';
import { DynamoDBService } from '../dynamodb/dynamodb.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { OrgWithRoleDto } from './dto/org-with-role.dto';
import { v4 as uuidv4 } from 'uuid';
import { OrgMember } from './entities/org-member.entity';

import {
  PutCommand,
  QueryCommandInput,
  QueryCommand,
  GetCommandInput,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';

@Injectable()
export class OrgService {
  private readonly orgsTable = 'Orgs';
  private readonly orgMembersTable = 'OrgMembers';

  constructor(private readonly dynamoDBService: DynamoDBService) {}

  private client() {
    return this.dynamoDBService.getClient;
  }

  async createOrg(dto: CreateOrgDto, userId: string) {
    const orgId = uuidv4();
    const createdAt = new Date().toISOString();

    await this.dynamoDBService.getClient.send(
      new PutCommand({
        TableName: this.orgsTable,
        Item: {
          id: orgId,
          name: dto.name,
          createdBy: userId,
          createdAt,
        },
      }),
    );

    await this.dynamoDBService.getClient.send(
      new PutCommand({
        TableName: this.orgMembersTable,
        Item: {
          orgId,
          userId,
          role: 'manager',
          createdAt,
        },
      }),
    );

    return { orgId, name: dto.name };
  }

  async addMember(orgId: string | undefined, dto: AddMemberDto) {
    if (!orgId) {
      return {};
    }

    const createdAt = new Date().toISOString();

    await this.dynamoDBService.getClient.send(
      new PutCommand({
        TableName: this.orgMembersTable,
        Item: {
          orgId,
          email: dto.email,
          role: dto.role,
          createdAt,
        },
      }),
    );

    return { orgId, userId: dto.email, role: dto.role };
  }

  async getMembers(
    orgId: string | undefined,
    limit = 10,
    lastKey?: string,
  ): Promise<{ items: OrgMember[]; nextKey?: string }> {
    if (!orgId) {
      return {
        items: [],
        nextKey: undefined,
      };
    }

    const params: QueryCommandInput = {
      TableName: this.orgMembersTable,
      KeyConditionExpression: 'orgId = :orgId',
      ExpressionAttributeValues: {
        ':orgId': orgId,
      },
      Limit: limit,
    };

    if (lastKey) {
      params.ExclusiveStartKey = { orgId, email: lastKey };
    }

    const result = await this.dynamoDBService.getClient.send(
      new QueryCommand(params),
    );
    return {
      items: result.Items as OrgMember[],
      nextKey: result.LastEvaluatedKey
        ? result.LastEvaluatedKey.email
        : undefined,
    };
  }

  async getOrgsOfUser(email: string): Promise<OrgWithRoleDto> {
    const params: GetCommandInput = {
      TableName: this.orgMembersTable,
      Key: { email },
    };
    const memberResult = await this.dynamoDBService.getClient.send(
      new GetCommand(params),
    );

    if (!memberResult.Item) {
      throw new NotFoundException(`No org found for user ${email}`);
    }

    const member: OrgMember = memberResult.Item as OrgMember;

    const orgParams: GetCommandInput = {
      TableName: this.orgsTable,
      Key: { id: member.orgId },
    };
    const orgResult = await this.dynamoDBService.getClient.send(
      new GetCommand(orgParams),
    );

    if (!orgResult.Item) {
      throw new NotFoundException(`Org ${member.orgId} not found`);
    }

    return {
      id: orgResult.Item.id,
      name: orgResult.Item.name,
      role: member.role,
      createdAt: member.createdAt,
    };
  }
}
