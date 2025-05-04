import { BalancedTeams } from '@domain/entities/balanced-teams';
import { TeamBalanceService } from '@domain/services/team-balance.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GenerateBalancedTeamsUseCase {
  constructor(private readonly teamBalanceService: TeamBalanceService) {}

  async execute(players: string[]): Promise<BalancedTeams> {
    console.log('players', players);
    return await this.teamBalanceService.generateBalancedTeams(players);
  }
}
