import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { PhoneNormalizationService } from '../../domain/services/phone-normalization.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, PhoneNormalizationService],
  exports: [UsersService],
})
export class UsersModule {}
