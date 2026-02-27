import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PhoneNormalizationService } from '../../domain/services/phone-normalization.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PhoneNormalizationService],
  exports: [AuthService],
})
export class AuthModule {}
