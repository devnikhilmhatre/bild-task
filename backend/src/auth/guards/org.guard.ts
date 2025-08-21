import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { CacheService } from '../../cache/cache.service';
import { OrgService } from '../../org/org.service';
import { type RequestWithUser } from './types';
import { OrgWithRoleDto } from './../../org/dto/org-with-role.dto';

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

    let member: OrgWithRoleDto | null = await this.cache.get(cacheKey);

    if (!member) {
      member = await this.orgService.getOrgsOfUser(user.email);
      if (!member) {
        throw new UnauthorizedException('No access to this org');
      }

      await this.cache.set(cacheKey, member, 900);
    }

    request.user.role = member.role;
    request.user.orgId = member.id;
    return true;
  }
}
