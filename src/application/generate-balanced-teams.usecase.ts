import { BalancedTeams } from '@domain/entities/balanced-teams.entity';
import { TeamBalanceService } from '@domain/services/team-balance.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GenerateBalancedTeamsUseCase {
  constructor(private readonly teamBalanceService: TeamBalanceService) {}

  async execute(players: string[]): Promise<BalancedTeams> {
    return await this.teamBalanceService.generateBalancedTeams(players);
  }
}
