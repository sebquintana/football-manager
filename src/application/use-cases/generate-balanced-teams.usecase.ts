import { Inject, Injectable } from '@nestjs/common';
import { PlayerRepository } from '@domain/ports/player.repository';
import { GenerateBalancedTeamsDto } from '../dto/generate-balanced-teams.dto';
import { BalancedTeamOptionDto } from '../dto/balanced-teams-response.dto';
import { Player } from '@domain/entities/player';
import { combinations } from '@utils/combinations';
import { MatchRepository } from '@domain/ports/match.repository';

interface TeamMetrics {
  avgElo: number;
  avgWinRate: number;
  recentForm: number; // Promedio de últimos 5 partidos (1=win, 0.5=draw, 0=loss)
  synergyScore: number; // Qué tan bien juegan juntos históricamente
  victoryProbability: number; // Probabilidad estimada de victoria
}

interface EnhancedBalancedTeamOptionDto extends BalancedTeamOptionDto {
  teamAMetrics: TeamMetrics;
  teamBMetrics: TeamMetrics;
  balanceScore: number; // Qué tan equilibrado está el match (0=perfecto, mayor=peor)
  synergyWarnings: string[]; // Duplas problemáticas detectadas
}

@Injectable()
export class GenerateBalancedTeamsUseCase {
  constructor(
    @Inject('PlayerRepository')
    private readonly playerRepository: PlayerRepository,
    @Inject('MatchRepository')
    private readonly matchRepository: MatchRepository,
  ) {}

  async execute(dto: GenerateBalancedTeamsDto): Promise<EnhancedBalancedTeamOptionDto[]> {
    const allPlayers = await this.playerRepository.findAll();
    const allMatches = await this.matchRepository.findAll();

    const selectedPlayers: Player[] = dto.playerNames.map((name: string) => {
      const player = allPlayers.find((p: Player) => p.name.toLowerCase() === name.toLowerCase());
      if (!player) throw new Error(`Player not found: ${name}`);
      return player;
    });

    // Calcular sinergias entre todos los jugadores
    const synergyMatrix = this.calculateSynergyMatrix(selectedPlayers, allMatches);

    const allTeams = combinations(selectedPlayers, 5);
    const results: EnhancedBalancedTeamOptionDto[] = [];
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
        continue;
      }

      // Filtrar combinaciones duplicadas
      const key = `${teamANames.join(',')}|${teamBNames.join(',')}`;
      const reverseKey = `${teamBNames.join(',')}|${teamANames.join(',')}`;
      if (seenCombinations.has(key) || seenCombinations.has(reverseKey)) {
        continue;
      }
      seenCombinations.add(key);

      // Calcular métricas avanzadas
      const teamAMetrics = this.calculateTeamMetrics(teamA, allMatches, synergyMatrix);
      const teamBMetrics = this.calculateTeamMetrics(teamB, allMatches, synergyMatrix);

      // Detectar duplas problemáticas
      const synergyWarnings = this.detectProblematicPairs(teamA, teamB, synergyMatrix);

      // Calcular score de balance general
      const balanceScore = this.calculateBalanceScore(teamAMetrics, teamBMetrics);

      const eloA = teamA.reduce((sum: number, p: Player) => sum + p.elo, 0);
      const eloB = teamB.reduce((sum: number, p: Player) => sum + p.elo, 0);

      results.push({
        teamA: teamA.map((p: Player) => p.name),
        eloA,
        teamB: teamB.map((p: Player) => p.name),
        eloB,
        difference: Math.abs(eloA - eloB),
        teamAMetrics,
        teamBMetrics,
        balanceScore,
        synergyWarnings,
      });
    }

    // Ordenar por balance score (mejor balance = menor score)
    return results.sort((a, b) => a.balanceScore - b.balanceScore).slice(0, 15);
  }

  private calculateSynergyMatrix(
    players: Player[],
    matches: any[],
  ): Map<string, Map<string, { wins: number; total: number; winRate: number }>> {
    const synergyMatrix = new Map();

    // Inicializar matriz
    for (const p1 of players) {
      synergyMatrix.set(p1.id, new Map());
      for (const p2 of players) {
        if (p1.id !== p2.id) {
          synergyMatrix.get(p1.id).set(p2.id, { wins: 0, total: 0, winRate: 0 });
        }
      }
    }

    // Analizar partidos históricos
    for (const match of matches) {
      const teamAIds = match.teamA.players.map((p: any) => p.id);
      const teamBIds = match.teamB.players.map((p: any) => p.id);

      // Procesar sinergias del equipo A
      this.updateTeamSynergies(teamAIds, match.winner === 'A', synergyMatrix);
      // Procesar sinergias del equipo B
      this.updateTeamSynergies(teamBIds, match.winner === 'B', synergyMatrix);
    }

    // Calcular winrates
    for (const [playerId, teammates] of synergyMatrix) {
      for (const [teammateId, stats] of teammates) {
        if (stats.total > 0) {
          stats.winRate = stats.wins / stats.total;
        }
      }
    }

    return synergyMatrix;
  }

  private updateTeamSynergies(
    teamIds: string[],
    won: boolean,
    synergyMatrix: Map<string, Map<string, any>>,
  ): void {
    for (let i = 0; i < teamIds.length; i++) {
      for (let j = i + 1; j < teamIds.length; j++) {
        const p1 = teamIds[i];
        const p2 = teamIds[j];

        if (synergyMatrix.has(p1) && synergyMatrix.get(p1)?.has(p2)) {
          const p1Stats = synergyMatrix.get(p1)?.get(p2);
          if (p1Stats) {
            p1Stats.total++;
            if (won) p1Stats.wins++;
          }
        }

        if (synergyMatrix.has(p2) && synergyMatrix.get(p2)?.has(p1)) {
          const p2Stats = synergyMatrix.get(p2)?.get(p1);
          if (p2Stats) {
            p2Stats.total++;
            if (won) p2Stats.wins++;
          }
        }
      }
    }
  }

  private calculateTeamMetrics(
    team: Player[],
    allMatches: any[],
    synergyMatrix: Map<string, Map<string, any>>,
  ): TeamMetrics {
    const avgElo = team.reduce((sum, p) => sum + p.elo, 0) / team.length;

    // Calcular winrate promedio del equipo
    const avgWinRate =
      team.reduce((sum, p) => {
        const wins = p.winCount;
        const draws = p.drawCount;
        const total = p.totalMatchesPlayed;
        return sum + (total > 0 ? (wins + draws * 0.5) / total : 0);
      }, 0) / team.length;

    // Calcular forma reciente (últimos 5 partidos)
    const recentForm = this.calculateRecentForm(team, allMatches);

    // Calcular sinergia del equipo
    const synergyScore = this.calculateTeamSynergy(team, synergyMatrix);

    // Calcular probabilidad de victoria basada en todas las métricas
    const victoryProbability = this.calculateVictoryProbability(
      avgElo,
      avgWinRate,
      recentForm,
      synergyScore,
    );

    return {
      avgElo,
      avgWinRate,
      recentForm,
      synergyScore,
      victoryProbability,
    };
  }

  private calculateRecentForm(team: Player[], allMatches: any[]): number {
    let totalForm = 0;
    let playerCount = 0;

    for (const player of team) {
      // Encontrar últimos 5 partidos del jugador
      const playerMatches = allMatches
        .filter(
          (m) =>
            m.teamA.players.some((p: any) => p.id === player.id) ||
            m.teamB.players.some((p: any) => p.id === player.id),
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      if (playerMatches.length > 0) {
        let playerForm = 0;
        for (const match of playerMatches) {
          const isInTeamA = match.teamA.players.some((p: any) => p.id === player.id);
          const won = (isInTeamA && match.winner === 'A') || (!isInTeamA && match.winner === 'B');
          const draw = match.winner === 'draw';

          if (won) playerForm += 1;
          else if (draw) playerForm += 0.5;
          // Loss = 0
        }
        totalForm += playerForm / playerMatches.length;
        playerCount++;
      }
    }

    return playerCount > 0 ? totalForm / playerCount : 0.5;
  }

  private calculateTeamSynergy(
    team: Player[],
    synergyMatrix: Map<string, Map<string, any>>,
  ): number {
    let totalSynergy = 0;
    let pairCount = 0;

    for (let i = 0; i < team.length; i++) {
      for (let j = i + 1; j < team.length; j++) {
        const p1 = team[i];
        const p2 = team[j];

        if (synergyMatrix.has(p1.id) && synergyMatrix.get(p1.id)?.has(p2.id)) {
          const stats = synergyMatrix.get(p1.id)?.get(p2.id);
          if (stats.total >= 2) {
            // Solo considerar duplas con al menos 2 partidos juntos
            totalSynergy += stats.winRate;
            pairCount++;
          }
        }
      }
    }

    return pairCount > 0 ? totalSynergy / pairCount : 0.5; // Default neutral si no hay data
  }

  private calculateVictoryProbability(
    avgElo: number,
    avgWinRate: number,
    recentForm: number,
    synergyScore: number,
  ): number {
    // Pesos para cada métrica
    const eloWeight = 0.4;
    const winRateWeight = 0.3;
    const formWeight = 0.2;
    const synergyWeight = 0.1;

    // Normalizar ELO (asumiendo rango 900-1100)
    const normalizedElo = Math.max(0, Math.min(1, (avgElo - 900) / 200));

    return (
      normalizedElo * eloWeight +
      avgWinRate * winRateWeight +
      recentForm * formWeight +
      synergyScore * synergyWeight
    );
  }

  private calculateBalanceScore(teamAMetrics: TeamMetrics, teamBMetrics: TeamMetrics): number {
    // Diferencias entre equipos (menor = mejor balance)
    const eloDiff = Math.abs(teamAMetrics.avgElo - teamBMetrics.avgElo);
    const winRateDiff = Math.abs(teamAMetrics.avgWinRate - teamBMetrics.avgWinRate);
    const formDiff = Math.abs(teamAMetrics.recentForm - teamBMetrics.recentForm);
    const probabilityDiff = Math.abs(
      teamAMetrics.victoryProbability - teamBMetrics.victoryProbability,
    );

    // Score ponderado (menor = mejor)
    return (
      eloDiff * 0.4 +
      winRateDiff * 100 * 0.3 + // Multiplicar por 100 para escalar
      formDiff * 100 * 0.2 +
      probabilityDiff * 100 * 0.1
    );
  }

  private detectProblematicPairs(
    teamA: Player[],
    teamB: Player[],
    synergyMatrix: Map<string, Map<string, any>>,
  ): string[] {
    const warnings: string[] = [];
    const threshold = 0.3; // Duplas con menos de 30% winrate son problemáticas

    const checkTeam = (team: Player[], teamName: string) => {
      for (let i = 0; i < team.length; i++) {
        for (let j = i + 1; j < team.length; j++) {
          const p1 = team[i];
          const p2 = team[j];

          if (synergyMatrix.has(p1.id) && synergyMatrix.get(p1.id)?.has(p2.id)) {
            const stats = synergyMatrix.get(p1.id)?.get(p2.id);
            if (stats.total >= 3 && stats.winRate < threshold) {
              warnings.push(
                `Equipo ${teamName}: ${p1.name} y ${p2.name} tienen baja sinergia (${(stats.winRate * 100).toFixed(1)}% en ${stats.total} partidos)`,
              );
            }
          }
        }
      }
    };

    checkTeam(teamA, 'A');
    checkTeam(teamB, 'B');

    return warnings;
  }

  async executeOld(dto: GenerateBalancedTeamsDto): Promise<BalancedTeamOptionDto[]> {
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
