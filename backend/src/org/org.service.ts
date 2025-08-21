import { Injectable, NotFoundException } from '@nestjs/common';
import { DynamoDBService } from '../dynamodb/dynamodb.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { OrgWithRoleDto } from './dto/org-with-role.dto';
import { v4 as uuidv4 } from 'uuid';
import { OrgMember } from './entities/org-member.entity';

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
          createdAt: createdAt,
        },
      })
      .promise();

    return { orgId, name: dto.name };
  }

  async addMember(orgId: string, dto: AddMemberDto) {
    const createdAt = new Date().toISOString();

    await this.client()
      .put({
        TableName: this.orgMembersTable,
        Item: {
          orgId,
          email: dto.email,
          role: dto.role,
          createdAt,
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

  async getOrgsOfUser(email: string): Promise<OrgWithRoleDto> {
    const memberResult = await this.client()
      .get({
        TableName: this.orgMembersTable,
        Key: { email },
      })
      .promise();

    if (!memberResult.Item) {
      throw new NotFoundException(`No org found for user ${email}`);
    }

    const member: OrgMember = memberResult.Item as OrgMember;

    const orgResult = await this.client()
      .get({
        TableName: this.orgsTable,
        Key: { id: member.orgId },
      })
      .promise();

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
