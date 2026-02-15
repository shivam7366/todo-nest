import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  MinDate,
  MinLength,
} from 'class-validator';

export class TaskDto {
  @ApiProperty({ example: 'Task Title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Task Description' })
  @IsString()
  description: string;

  @ApiProperty({ example: '2026/02/17' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @MinDate(new Date(), { message: 'Deadline must be in the future' })
  deadline: string;
}
