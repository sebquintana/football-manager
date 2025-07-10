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

    const selectedPlayers: Player[] = dto.playerNames.map((name: string) => {
      const player = allPlayers.find((p: Player) => p.name.toLowerCase() === name.toLowerCase());
      if (!player) throw new Error(`Player not found: ${name}`);
      return player;
    });

    const allTeams = combinations(selectedPlayers, 5);
    const results: BalancedTeamOptionDto[] = [];
    const seenCombinations = new Set<string>();
    for (const teamA of allTeams) {
      // Restricción: Nico y Nahue no pueden estar en el mismo equipo
      const teamANames = teamA
        .map((p: Player) => p.name.toLowerCase())
        .sort((a, b) => a.localeCompare(b));
      const teamB = selectedPlayers.filter((p) => !teamA.includes(p));
      const teamBNames = teamB
        .map((p: Player) => p.name.toLowerCase())
        .sort((a, b) => a.localeCompare(b));
      if (
        (teamANames.includes('nico') && teamANames.includes('nahue')) ||
        (teamBNames.includes('nico') && teamBNames.includes('nahue'))
      ) {
        continue; // Salta esta combinación si Nico y Nahue están juntos en cualquier equipo
      }
      // Filtrar combinaciones duplicadas (A/B y B/A)
      const key = `${teamANames.join(',')}|${teamBNames.join(',')}`;
      const reverseKey = `${teamBNames.join(',')}|${teamANames.join(',')}`;
      if (seenCombinations.has(key) || seenCombinations.has(reverseKey)) {
        continue;
      }
      seenCombinations.add(key);
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

    return results.sort((a, b) => a.difference - b.difference).slice(0, 10); // top 10
  }
}
