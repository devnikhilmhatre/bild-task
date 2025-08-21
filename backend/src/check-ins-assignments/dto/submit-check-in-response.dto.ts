import { IsArray } from 'class-validator';

export class SubmitCheckInResponseDto {
  @IsArray()
  answers: any[];
}
