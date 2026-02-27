import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';

@Controller('availability')
@UseGuards(FirebaseAuthGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get(':userId')
  getByUserId(@Param('userId') userId: string) {
    return this.availabilityService.getByUserId(userId);
  }

  @Put(':userId')
  update(@Param('userId') userId: string, @Body() dto: UpdateAvailabilityDto) {
    return this.availabilityService.update(userId, dto);
  }
}
