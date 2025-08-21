import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly cacheClient: Redis;

  constructor(private readonly configService: ConfigService) {
    this.cacheClient = new Redis({
      host: this.configService.get<string>('CACHE_HOST'),
      port: this.configService.get<number>('CACHE_PORT'),
    });
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const val = typeof value === 'string' ? value : JSON.stringify(value);

    if (ttlSeconds) {
      await this.cacheClient.set(key, val, 'EX', ttlSeconds);
    } else {
      await this.cacheClient.set(key, val);
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    const val = await this.cacheClient.get(key);
    if (!val) return null;

    try {
      return JSON.parse(val) as T;
    } catch {
      return val as T;
    }
  }

  async del(key: string): Promise<void> {
    await this.cacheClient.del(key);
  }

  getClient(): Redis {
    return this.cacheClient;
  }

  async onModuleDestroy() {
    await this.cacheClient.quit();
  }
}
