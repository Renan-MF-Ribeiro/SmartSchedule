import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';

@Controller('schedules')
@UseGuards(FirebaseAuthGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(req.user.uid, dto);
  }

  @Get()
  findByMonth(@Query('year') year: string, @Query('month') month: string) {
    return this.schedulesService.findByMonth(+year, +month);
  }

  @Get('range')
  findByDateRange(@Query('start') start: string, @Query('end') end: string) {
    return this.schedulesService.findByDateRange(start, end);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schedulesService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateScheduleDto) {
    return this.schedulesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schedulesService.delete(id);
  }

  @Post(':id/comments')
  addComment(
    @Param('id') scheduleId: string,
    @Req() req: any,
    @Body('content') content: string,
    @Body('userName') userName: string,
  ) {
    return this.schedulesService.addComment(scheduleId, req.user.uid, userName, content);
  }
}
