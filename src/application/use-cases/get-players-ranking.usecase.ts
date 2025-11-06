import { Inject, Injectable } from '@nestjs/common';
import { PlayerRepository } from '@domain/ports/player.repository';
import { MatchRepository } from '@domain/ports/match.repository';
import { PlayerEloDTO } from '@application/dto/player-ranking.response.dto';

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
      }));
  }
}
