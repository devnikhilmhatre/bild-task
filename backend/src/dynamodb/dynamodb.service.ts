import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

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
}
