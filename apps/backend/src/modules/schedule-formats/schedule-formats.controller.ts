import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { ScheduleFormatsService } from './schedule-formats.service';
import { CreateScheduleFormatDto } from './dto/create-schedule-format.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';

@Controller('schedule-formats')
@UseGuards(FirebaseAuthGuard)
export class ScheduleFormatsController {
  constructor(private readonly service: ScheduleFormatsService) {}

  @Put()
  upsert(@Req() req: any, @Body() dto: CreateScheduleFormatDto) {
    return this.service.upsert(req.user.uid, dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':dayOfWeek')
  findByDay(@Param('dayOfWeek') dayOfWeek: string) {
    return this.service.findByDayOfWeek(+dayOfWeek);
  }
}
