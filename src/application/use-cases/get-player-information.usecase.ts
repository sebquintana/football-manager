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
  synergies: {
    bestMate: string | null;
    worstMate: string | null;
    mates: Array<{
      mate: string;
      victories: number;
      matches: number;
      winRate: number;
    }>;
  };
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

    // --- Calcular sinergias ---
    // Map: compañeroId -> { nombre, victorias, partidos }
    const synergyMap: Record<string, { mate: string; victories: number; matches: number }> = {};
    for (const match of playerMatches) {
      // Determinar en qué equipo jugó el jugador
      let myTeamPlayers, won;
      if (match.teamA.players.some((p: any) => p.id === player.id)) {
        myTeamPlayers = match.teamA.players;
        won = match.winner === 'A';
      } else {
        myTeamPlayers = match.teamB.players;
        won = match.winner === 'B';
      }
      for (const mate of myTeamPlayers) {
        if (mate.id === player.id) continue;
        if (!synergyMap[mate.id]) {
          synergyMap[mate.id] = { mate: mate.name, victories: 0, matches: 0 };
        }
        synergyMap[mate.id].matches++;
        if (won) synergyMap[mate.id].victories++;
      }
    }
    const matesArr = Object.values(synergyMap).map((s) => ({
      ...s,
      winRate: s.matches > 0 ? Math.round((s.victories / s.matches) * 100) : 0,
    }));

    // Filtramos compañeros con los que jugó al menos el 25% de sus partidos
    const minimumMatchesRequired = Math.ceil(player.totalMatchesPlayed * 0.25);
    const significantMates = matesArr.filter((mate) => mate.matches >= minimumMatchesRequired);

    // Mejor compañero: mayor winRate, en empate el de más partidos
    let bestMate = null;
    let worstMate = null;
    if (significantMates.length > 0) {
      significantMates.sort((a, b) => b.winRate - a.winRate || b.matches - a.matches);
      bestMate = significantMates[0].mate;
      significantMates.sort((a, b) => a.winRate - b.winRate || b.matches - a.matches);
      worstMate = significantMates[0].mate;
    }

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
      synergies: {
        bestMate,
        worstMate,
        mates: matesArr,
      },
    };
  }
}
