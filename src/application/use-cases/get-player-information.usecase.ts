import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PlayerRepository } from '@domain/ports/player.repository';
import { MatchRepository } from '@domain/ports/match.repository';

export interface PlayerInformationDto {
  id: string;
  name: string;
  elo: number;
  initialElo: number;
  totalMatchesPlayed: number;
  winCount: number;
  lossCount: number;
  drawCount: number;
  goalsFor: number;
  goalsAgainst: number;
  history: Array<{
    oldElo: number;
    newElo: number;
    changedAt: string;
    matchId?: string;
    teamAPlayers?: string[];
    teamBPlayers?: string[];
  }>;
}

@Injectable()
export class GetPlayerInformationUseCase {
  constructor(
    @Inject('PlayerRepository')
    private readonly playerRepository: PlayerRepository,
    @Inject('MatchRepository')
    private readonly matchRepository: MatchRepository,
  ) {}

  async execute(playerName: string): Promise<PlayerInformationDto> {
    const allPlayers = await this.playerRepository.findAll();
    const player = allPlayers.find((p) => p.name.toLowerCase() === playerName.toLowerCase());
    if (!player) throw new NotFoundException('Player not found');

    // Buscar los partidos donde jugó este jugador
    const matches = await this.matchRepository.findAll();
    const playerMatches = matches.filter(
      (m) =>
        m.teamA.players.some((p) => p.id === player.id) ||
        m.teamB.players.some((p) => p.id === player.id),
    );

    // Mapear history con equipos si es posible
    const historyWithTeams = player.history.map((h) => {
      let match: any = undefined;
      if (h.matchId) {
        match = playerMatches.find((m) => m.id === h.matchId);
      } else {
        match = playerMatches.find((m) => {
          return (
            m.date &&
            Math.abs(new Date(h.changedAt).getTime() - m.date.getTime()) < 1000 * 60 * 60 * 24
          );
        });
      }
      return {
        ...h,
        changedAt:
          typeof h.changedAt === 'string' ? h.changedAt : new Date(h.changedAt).toISOString(),
        teamAPlayers: match ? match.teamA.players.map((p: any) => p.name) : undefined,
        teamBPlayers: match ? match.teamB.players.map((p: any) => p.name) : undefined,
      };
    });

    return {
      id: player.id,
      name: player.name,
      elo: player.elo,
      initialElo: player.initialElo,
      totalMatchesPlayed: player.totalMatchesPlayed,
      winCount: player.winCount,
      lossCount: player.lossCount,
      drawCount: player.drawCount,
      goalsFor: player.goalsFor,
      goalsAgainst: player.goalsAgainst,
      history: historyWithTeams,
    };
  }
}
