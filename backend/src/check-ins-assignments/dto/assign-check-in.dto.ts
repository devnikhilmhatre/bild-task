import { IsArray, ArrayMaxSize, ArrayMinSize, IsEmail } from 'class-validator';

export class AssignCheckInDto {
  @IsArray()
  @IsEmail({}, { each: true })
  @ArrayMinSize(1, { message: 'At least one member email is required' })
  @ArrayMaxSize(1000, {
    message: 'Cannot assign more than 1000 members at once',
  })
  memberEmails: string[];
}
