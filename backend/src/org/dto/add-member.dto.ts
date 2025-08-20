import { IsString, IsIn } from 'class-validator';

export class AddMemberDto {
  @IsString()
  email: string;

  @IsIn(['manager', 'member'])
  role: 'manager' | 'member';
}
