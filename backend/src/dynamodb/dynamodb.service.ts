import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import {
  DynamoDBClient,
  CreateTableCommand,
  ListTablesCommand,
  AttributeDefinition,
  KeySchemaElement,
  ProvisionedThroughput,
} from '@aws-sdk/client-dynamodb';

@Injectable()
export class DynamoDBService {
  private readonly client: DynamoDBDocumentClient;

  constructor(private readonly configService: ConfigService) {
    const rawClient = new DynamoDBClient({
      endpoint:
        this.configService.get<string>('DYNAMODB_ENDPOINT') ||
        'http://localhost:4566',
      region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId:
          this.configService.get<string>('AWS_ACCESS_KEY_ID') || 'test',
        secretAccessKey:
          this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || 'test',
      },
    });

    this.client = DynamoDBDocumentClient.from(rawClient);
  }

  get getClient(): DynamoDBDocumentClient {
    return this.client;
  }

  async onModuleInit() {
    const tablesToCreate = [
      {
        name: 'Users',
        keySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
        attributeDefinitions: [{ AttributeName: 'email', AttributeType: 'S' }],
      },
      {
        name: 'Orgs',
        keySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        attributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      },
      {
        name: 'OrgMembers',
        keySchema: [
          { AttributeName: 'orgId', KeyType: 'HASH' },
          { AttributeName: 'email', KeyType: 'RANGE' },
        ],
        attributeDefinitions: [
          { AttributeName: 'orgId', AttributeType: 'S' },
          { AttributeName: 'email', AttributeType: 'S' },
        ],
      },
      {
        name: 'CheckIns',
        keySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        attributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      },
      {
        name: 'CheckInAssignments',
        keySchema: [
          { AttributeName: 'checkInId', KeyType: 'HASH' },
          { AttributeName: 'memberEmail', KeyType: 'RANGE' },
        ],
        attributeDefinitions: [
          { AttributeName: 'checkInId', AttributeType: 'S' },
          { AttributeName: 'memberEmail', AttributeType: 'S' },
        ],
      },
    ];

    const existingTables = await this.getClient.send(new ListTablesCommand({}));

    for (const table of tablesToCreate) {
      if (!existingTables.TableNames?.includes(table.name)) {
        console.log(`Creating DynamoDB table: ${table.name}`);
        await this.getClient.send(
          new CreateTableCommand({
            TableName: table.name,
            KeySchema: table.keySchema as KeySchemaElement[],
            AttributeDefinitions:
              table.attributeDefinitions as AttributeDefinition[],
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            } as ProvisionedThroughput,
          }),
        );
      }
    }
  }
}
