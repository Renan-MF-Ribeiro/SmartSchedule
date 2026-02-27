import { IsEnum, IsArray, IsString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DayOfWeek } from '@smartschedule/shared';

export class PositionTemplateDto {
  @IsString()
  id: string;

  @IsString()
  label: string;

  @IsNumber()
  order: number;
}

export class CreateScheduleFormatDto {
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PositionTemplateDto)
  positions: PositionTemplateDto[];
}
