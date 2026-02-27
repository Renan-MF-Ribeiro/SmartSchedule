import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PhoneNormalizationService } from '../../domain/services/phone-normalization.service';
import { IUser } from '@smartschedule/shared';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly phoneNorm: PhoneNormalizationService,
  ) {}

  async createOrLink(firebaseUid: string, dto: CreateUserDto): Promise<IUser> {
    const normalizedPhone = this.phoneNorm.normalize(dto.phone);
    const now = new Date().toISOString();

    const user: Omit<IUser, 'id'> = {
      name: dto.name,
      phone: normalizedPhone,
      fcmTokens: [],
      teamIds: dto.teamIds ?? [],
      isAdmin: dto.isAdmin ?? false,
      createdAt: now,
      updatedAt: now,
    };

    return this.usersRepo.create(firebaseUid, user);
  }

  async findById(id: string): Promise<IUser> {
    const user = await this.usersRepo.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByPhone(phone: string): Promise<IUser | null> {
    return this.usersRepo.findByPhone(phone);
  }

  async update(id: string, dto: UpdateUserDto): Promise<void> {
    await this.usersRepo.update(id, dto as Partial<IUser>);
  }

  async addFcmToken(userId: string, token: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user.fcmTokens.includes(token)) {
      await this.usersRepo.update(userId, { fcmTokens: [...user.fcmTokens, token] });
    }
  }
}
