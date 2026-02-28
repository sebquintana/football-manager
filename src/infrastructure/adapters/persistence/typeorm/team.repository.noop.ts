import { Injectable } from '@nestjs/common';
import { Team } from '@domain/entities/team';

@Injectable()
export class NoOpTeamRepository {
  async save(team: Team): Promise<Team> {
    return team;
  }

  async findAll(): Promise<Team[]> {
    return [];
  }
}
