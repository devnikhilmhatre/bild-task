import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { CacheService } from '../../cache/cache.service';
import { OrgService } from '../../org/org.service';
import { type RequestWithUser } from './types';

@Injectable()
export class OrgGuard implements CanActivate {
  constructor(
    private readonly cache: CacheService,
    private readonly orgService: OrgService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Missing user or org context');
    }

    const cacheKey = `user:${user.email}`;

    let role = await this.cache.get(cacheKey);

    if (!role) {
      const member = await this.orgService.getMembers(user.email);
      if (!member) {
        throw new UnauthorizedException('No access to this org');
      }
      role = member;

      await this.cache.set(cacheKey, role, 900);
    }

    request.user.role = role;
    return true;
  }
}
