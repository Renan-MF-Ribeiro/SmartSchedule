import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DayOfWeek } from '@smartschedule/shared';

export class TimeSlotDto {
  @IsString()
  start: string;

  @IsString()
  end: string;
}

export class SpecificUnavailabilityDto {
  @IsString()
  date: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateAvailabilityDto {
  @IsOptional()
  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  availableDays?: DayOfWeek[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  availableTimeSlots?: TimeSlotDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecificUnavailabilityDto)
  specificUnavailabilities?: SpecificUnavailabilityDto[];
}
