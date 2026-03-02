import { Inject, Injectable } from '@nestjs/common';
import { PlayerRepository } from '@domain/ports/player.repository';
import { MatchRepository } from '@domain/ports/match.repository';
import { PlayerEloDTO } from '@application/dto/player-ranking.response.dto';

function getRecentForm(playerId: string, matches: any[]): ('V' | 'D' | 'E')[] {
  return matches
    .filter(
      (m) =>
        m.teamA.players.some((p: any) => p.id === playerId) ||
        m.teamB.players.some((p: any) => p.id === playerId),
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-5)
    .map((match) => {
      const inTeamA = match.teamA.players.some((p: any) => p.id === playerId);
      const won = inTeamA ? match.winner === 'A' : match.winner === 'B';
      const lost = inTeamA ? match.winner === 'B' : match.winner === 'A';
      if (won) return 'V';
      if (lost) return 'D';
      return 'E';
    });
}

@Injectable()
export class GetPlayersRankingUseCase {
  constructor(
    @Inject('PlayerRepository')
    private readonly playerRepository: PlayerRepository,
    @Inject('MatchRepository')
    private readonly matchRepository: MatchRepository,
  ) {}

  async execute(): Promise<PlayerEloDTO[]> {
    const players = await this.playerRepository.findAll();
    const matches = await this.matchRepository.findAll();
    const totalMatches = matches.length;

    return players
      .filter((player) => {
        // Filtrar solo jugadores con más del 50% de asistencia
        const attendanceRate = totalMatches > 0 ? player.totalMatchesPlayed / totalMatches : 0;
        return attendanceRate > 0.3;
      })
      .sort((a, b) => b.elo - a.elo)
      .map((p, index) => ({
        position: index + 1,
        name: p.name,
        elo: p.elo,
        recentForm: getRecentForm(p.id, matches),
      }));
  }
}
