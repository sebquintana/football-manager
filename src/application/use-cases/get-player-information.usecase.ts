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
  winRate: number;
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
      draws: number;
      losses: number;
      matches: number;
      winRate: number;
    }>;
  };
  streaks: {
    currentType: 'win' | 'loss' | 'draw' | null;
    currentCount: number;
    maxWinStreak: number;
    maxLossStreak: number;
  };
  attendanceRate: number;
  recentForm: ('V' | 'D' | 'E')[];
  rivals: {
    hardestOpponent: string | null;
    easiestOpponent: string | null;
    opponents: Array<{
      opponent: string;
      victories: number;
      losses: number;
      draws: number;
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

  async execute(playerName: string, season?: number): Promise<PlayerInformationDto> {
    const allPlayers = await this.playerRepository.findAll();
    const player = allPlayers.find((p) => p.name.toLowerCase() === playerName.toLowerCase());
    if (!player) throw new NotFoundException('Player not found');

    // Buscar los partidos donde jugó este jugador
    const matches = await this.matchRepository.findAll(season);
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
    // Map: compañeroId -> { nombre, victorias, empates, derrotas, partidos }
    const synergyMap: Record<
      string,
      { mate: string; victories: number; draws: number; losses: number; matches: number }
    > = {};
    for (const match of playerMatches) {
      // Determinar en qué equipo jugó el jugador
      let myTeamPlayers, won, lost;
      if (match.teamA.players.some((p: any) => p.id === player.id)) {
        myTeamPlayers = match.teamA.players;
        won = match.winner === 'A';
        lost = match.winner === 'B';
      } else {
        myTeamPlayers = match.teamB.players;
        won = match.winner === 'B';
        lost = match.winner === 'A';
      }
      const draw = match.winner === 'draw';

      for (const mate of myTeamPlayers) {
        if (mate.id === player.id) continue;
        if (!synergyMap[mate.id]) {
          synergyMap[mate.id] = { mate: mate.name, victories: 0, draws: 0, losses: 0, matches: 0 };
        }
        synergyMap[mate.id].matches++;
        if (won) synergyMap[mate.id].victories++;
        else if (lost) synergyMap[mate.id].losses++;
        else if (draw) synergyMap[mate.id].draws++;
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

    // --- Calcular rivales ---
    const rivalMap: Record<
      string,
      { opponent: string; victories: number; draws: number; losses: number; matches: number }
    > = {};
    for (const match of playerMatches) {
      let opponentTeamPlayers, won, lost;
      if (match.teamA.players.some((p: any) => p.id === player.id)) {
        opponentTeamPlayers = match.teamB.players;
        won = match.winner === 'A';
        lost = match.winner === 'B';
      } else {
        opponentTeamPlayers = match.teamA.players;
        won = match.winner === 'B';
        lost = match.winner === 'A';
      }
      const draw = match.winner === 'draw';

      for (const opp of opponentTeamPlayers) {
        if (!rivalMap[opp.id]) {
          rivalMap[opp.id] = { opponent: opp.name, victories: 0, draws: 0, losses: 0, matches: 0 };
        }
        rivalMap[opp.id].matches++;
        if (won) rivalMap[opp.id].victories++;
        else if (lost) rivalMap[opp.id].losses++;
        else if (draw) rivalMap[opp.id].draws++;
      }
    }
    const opponentsArr = Object.values(rivalMap).map((r) => ({
      ...r,
      winRate: r.matches > 0 ? Math.round((r.victories / r.matches) * 100) : 0,
    }));

    const significantOpponents = opponentsArr.filter(
      (r) => r.matches >= minimumMatchesRequired,
    );

    let hardestOpponent = null;
    let easiestOpponent = null;
    if (significantOpponents.length > 0) {
      significantOpponents.sort((a, b) => a.winRate - b.winRate || b.matches - a.matches);
      hardestOpponent = significantOpponents[0].opponent;
      significantOpponents.sort((a, b) => b.winRate - a.winRate || b.matches - a.matches);
      easiestOpponent = significantOpponents[0].opponent;
    }

    // --- Calcular rachas ---
    // Ordenar partidos por fecha ascendente
    const sortedMatches = playerMatches
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentType: 'win' | 'loss' | 'draw' | null = null;
    let currentCount = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let tempWinStreak = 0;
    let tempLossStreak = 0;
    for (const match of sortedMatches) {
      let won = false,
        lost = false;
      if (match.teamA.players.some((p: any) => p.id === player.id)) {
        won = match.winner === 'A';
        lost = match.winner === 'B';
      } else {
        won = match.winner === 'B';
        lost = match.winner === 'A';
      }
      let resultType: 'win' | 'loss' | 'draw';
      if (won) resultType = 'win';
      else if (lost) resultType = 'loss';
      else resultType = 'draw';
      // Racha actual
      if (currentType === null || currentType !== resultType) {
        currentType = resultType;
        currentCount = 1;
      } else {
        currentCount++;
      }
      // Racha máxima de victorias
      if (resultType === 'win') {
        tempWinStreak++;
        maxWinStreak = Math.max(maxWinStreak, tempWinStreak);
        tempLossStreak = 0;
      } else if (resultType === 'loss') {
        tempLossStreak++;
        maxLossStreak = Math.max(maxLossStreak, tempLossStreak);
        tempWinStreak = 0;
      } else {
        tempWinStreak = 0;
        tempLossStreak = 0;
      }
    }

    // Calcular forma reciente (últimos 5 partidos)
    const recentForm: ('V' | 'D' | 'E')[] = sortedMatches.slice(-5).map((match) => {
      const inTeamA = match.teamA.players.some((p: any) => p.id === player.id);
      const won = inTeamA ? match.winner === 'A' : match.winner === 'B';
      const lost = inTeamA ? match.winner === 'B' : match.winner === 'A';
      if (won) return 'V';
      if (lost) return 'D';
      return 'E';
    });

    // Calcular % de asistencia
    const totalMatches = matches.length;
    const attendanceRate =
      totalMatches > 0 ? Math.round((player.totalMatchesPlayed / totalMatches) * 100) : 0;

    // Calcular winrate (empates cuentan como medio punto)
    const equivalentWins = player.winCount + player.drawCount * 0.5;
    const winRate =
      player.totalMatchesPlayed > 0
        ? Math.round((equivalentWins / player.totalMatchesPlayed) * 100)
        : 0;

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
      winRate,
      history: historyWithTeams,
      synergies: {
        bestMate,
        worstMate,
        mates: matesArr,
      },
      streaks: {
        currentType,
        currentCount,
        maxWinStreak,
        maxLossStreak,
      },
      attendanceRate,
      recentForm,
      rivals: {
        hardestOpponent,
        easiestOpponent,
        opponents: opponentsArr,
      },
    };
  }
}
