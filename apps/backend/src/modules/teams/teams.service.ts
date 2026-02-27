import { Injectable, NotFoundException } from '@nestjs/common';
import { TeamsRepository } from './teams.repository';
import { CreateTeamDto } from './dto/create-team.dto';
import { ITeam } from '@smartschedule/shared';

@Injectable()
export class TeamsService {
  constructor(private readonly teamsRepo: TeamsRepository) {}

  async create(adminId: string, dto: CreateTeamDto): Promise<ITeam> {
    const now = new Date().toISOString();
    return this.teamsRepo.create({
      name: dto.name,
      description: dto.description,
      memberIds: dto.memberIds ?? [],
      adminId,
      createdAt: now,
      updatedAt: now,
    });
  }

  async findAll(): Promise<ITeam[]> {
    return this.teamsRepo.findAll();
  }

  async findById(id: string): Promise<ITeam> {
    const team = await this.teamsRepo.findById(id);
    if (!team) throw new NotFoundException(`Team ${id} not found`);
    return team;
  }

  async addMember(teamId: string, userId: string): Promise<void> {
    const team = await this.findById(teamId);
    if (!team.memberIds.includes(userId)) {
      await this.teamsRepo.update(teamId, { memberIds: [...team.memberIds, userId] });
    }
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    const team = await this.findById(teamId);
    await this.teamsRepo.update(teamId, {
      memberIds: team.memberIds.filter(id => id !== userId),
    });
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.teamsRepo.delete(id);
  }
}
