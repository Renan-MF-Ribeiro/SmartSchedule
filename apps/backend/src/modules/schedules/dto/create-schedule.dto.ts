import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  Matches,
  IsISO8601,
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

  order: number;
}

export class CreateScheduleDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsISO8601()
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
