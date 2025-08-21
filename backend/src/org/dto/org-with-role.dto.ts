import { Org } from '../entities/org.entity';
import { PickType } from '@nestjs/mapped-types';

export class OrgWithRoleDto extends PickType(Org, ['id', 'name'] as const) {
  role: 'manager' | 'member';
  createdAt: string;
}
