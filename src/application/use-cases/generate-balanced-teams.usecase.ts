import { Inject, Injectable } from '@nestjs/common';
import { PlayerRepository } from '@domain/ports/player.repository';
import { GenerateBalancedTeamsDto } from '../dto/generate-balanced-teams.dto';
import { BalancedTeamOptionDto } from '../dto/balanced-teams-response.dto';
import { Player } from '@domain/entities/player';
import { combinations } from '@utils/combinations'; 

@Injectable()
export class GenerateBalancedTeamsUseCase {
  constructor(
    @Inject('PlayerRepository')
    private readonly playerRepository: PlayerRepository,
  ) {}

  async execute(dto: GenerateBalancedTeamsDto): Promise<BalancedTeamOptionDto[]> {
    const allPlayers = await this.playerRepository.findAll();

    const selectedPlayers: Player[] = dto.playerIds.map(id => {
      const player = allPlayers.find(p => p.id === id);
      if (!player) throw new Error(`Player not found: ${id}`);
      return player;
    });

    const allTeams = combinations(selectedPlayers, 5);
    const results: BalancedTeamOptionDto[] = [];

    for (const teamA of allTeams) {
      const teamB = selectedPlayers.filter(p => !teamA.includes(p));
      const eloA = teamA.reduce((sum: number, p: Player) => sum + p.elo, 0);
      const eloB = teamB.reduce((sum: number, p: Player) => sum + p.elo, 0);
      results.push({
        teamA: teamA.map((p: Player) => p.name),
        eloA,
        teamB: teamB.map((p: Player) => p.name),
        eloB,
        difference: Math.abs(eloA - eloB),
      });
    }

    return results.sort((a, b) => a.difference - b.difference).slice(0, 5); // top 5
  }
}
