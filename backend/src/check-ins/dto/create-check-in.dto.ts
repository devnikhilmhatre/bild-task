import { IsString, IsArray, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class QuestionDto {
    @IsString()
    id: string;

    @IsString()
    text: string;
}

export class CreateCheckInDto {
    @IsString()
    title: string;

    @IsString()
    dueDate: string;

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => QuestionDto)
    questions: QuestionDto[];
}
