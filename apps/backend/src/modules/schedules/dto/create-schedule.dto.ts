import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  Matches,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSchedulePositionDto {
  @IsString()
  id: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  userPhone?: string;

  @IsNumber()
  order: number;
}

export class CreateScheduleDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in YYYY-MM-DD format' })
  date: string;

  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  startTime: string;

  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  endTime: string;

  @IsOptional()
  @IsString()
  teamId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSchedulePositionDto)
  positions: CreateSchedulePositionDto[];
}
