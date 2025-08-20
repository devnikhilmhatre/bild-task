import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DynamoDBService {
    private readonly databaseClient: AWS.DynamoDB.DocumentClient;

    constructor(private readonly configService: ConfigService) {
        this.databaseClient = new AWS.DynamoDB.DocumentClient({
            endpoint: this.configService.get<string>('DYNAMODB_ENDPOINT'),
            region: this.configService.get<string>('AWS_REGION'),
            accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
            secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
        });
    }

    getClient() {
        return this.databaseClient;
    }
}
