import { Inject, Injectable } from '@nestjs/common';
import { PlayerRepository } from '@domain/ports/player.repository';
import { GenerateBalancedTeamsDto } from '../dto/generate-balanced-teams.dto';
import { BalancedTeamOptionDto } from '../dto/balanced-teams-response.dto';
import { Player } from '@domain/entities/player';
import { combinations } from '@utils/combinations';
import { MatchRepository } from '@domain/ports/match.repository';

// Exponential decay weights for recent form (index 0 = most recent match)
const FORM_DECAY_WEIGHTS = [1.0, 0.8, 0.64, 0.512, 0.4096];

interface TeamMetrics {
  avgElo: number;
  avgWinRate: number;
  recentForm: number; // Promedio ponderado de últimos 5 partidos (1=win, 0.5=draw, 0=loss)
  synergyScore: number; // Qué tan bien juegan juntos históricamente (Bayesian-adjusted)
  victoryProbability: number; // Probabilidad estimada de victoria
}

interface EnhancedBalancedTeamOptionDto extends BalancedTeamOptionDto {
  teamAMetrics: TeamMetrics;
  teamBMetrics: TeamMetrics;
  balanceScore: number; // Diferencia de victoryProbability entre equipos (0=perfecto)
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

    // Pre-computar forma reciente por jugador (evita re-escanear partidos en cada combinación)
    const formByPlayerId = new Map<string, number>();
    for (const player of selectedPlayers) {
      formByPlayerId.set(player.id, this.calculatePlayerRecentForm(player, allMatches));
    }

    // Rango de ELO dinámico basado en el pool real (evita clampeo con valores hardcodeados)
    const elos = selectedPlayers.map((p) => p.elo);
    const minElo = Math.min(...elos);
    const maxElo = Math.max(...elos);

    const synergyMatrix = this.calculateSynergyMatrix(selectedPlayers, allMatches);

    const allTeams = combinations(selectedPlayers, 5);
    const results: EnhancedBalancedTeamOptionDto[] = [];
    const seenCombinations = new Set<string>();

    // Constraints configurables: por defecto Nico y Nahue no pueden estar juntos
    const mustSplit = (dto.mustSplit ?? [['nico', 'nahue']]).map((pair) =>
      pair.map((n) => n.toLowerCase()),
    );

    for (const teamA of allTeams) {
      const teamANames = teamA
        .map((p: Player) => p.name.toLowerCase())
        .sort((a, b) => a.localeCompare(b));
      const teamB = selectedPlayers.filter((p) => !teamA.includes(p));
      const teamBNames = teamB
        .map((p: Player) => p.name.toLowerCase())
        .sort((a, b) => a.localeCompare(b));

      // Aplicar constraints must-split
      const violatesConstraint = mustSplit.some(
        ([a, b]) =>
          (teamANames.includes(a) && teamANames.includes(b)) ||
          (teamBNames.includes(a) && teamBNames.includes(b)),
      );
      if (violatesConstraint) continue;

      // Filtrar combinaciones duplicadas (A vs B == B vs A)
      const key = `${teamANames.join(',')}|${teamBNames.join(',')}`;
      const reverseKey = `${teamBNames.join(',')}|${teamANames.join(',')}`;
      if (seenCombinations.has(key) || seenCombinations.has(reverseKey)) continue;
      seenCombinations.add(key);

      const teamAMetrics = this.calculateTeamMetrics(
        teamA,
        synergyMatrix,
        formByPlayerId,
        minElo,
        maxElo,
      );
      const teamBMetrics = this.calculateTeamMetrics(
        teamB,
        synergyMatrix,
        formByPlayerId,
        minElo,
        maxElo,
      );

      const synergyWarnings = this.detectProblematicPairs(teamA, teamB, synergyMatrix);
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

    return results.sort((a, b) => a.balanceScore - b.balanceScore).slice(0, 15);
  }

  private calculateSynergyMatrix(
    players: Player[],
    matches: any[],
  ): Map<string, Map<string, { wins: number; total: number; winRate: number }>> {
    const synergyMatrix = new Map();

    for (const p1 of players) {
      synergyMatrix.set(p1.id, new Map());
      for (const p2 of players) {
        if (p1.id !== p2.id) {
          synergyMatrix.get(p1.id).set(p2.id, { wins: 0, total: 0, winRate: 0 });
        }
      }
    }

    for (const match of matches) {
      const teamAIds = match.teamA.players.map((p: any) => p.id);
      const teamBIds = match.teamB.players.map((p: any) => p.id);
      this.updateTeamSynergies(teamAIds, match.winner === 'A', synergyMatrix);
      this.updateTeamSynergies(teamBIds, match.winner === 'B', synergyMatrix);
    }

    // Prior bayesiano: winRate ajustado = (wins + 1) / (total + 2)
    // Estabiliza estimaciones con pocos datos (0/0 → 0.5, 1/1 → 0.67 en vez de 1.0)
    for (const [, teammates] of synergyMatrix) {
      for (const [, stats] of teammates) {
        stats.winRate = (stats.wins + 1) / (stats.total + 2);
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
    synergyMatrix: Map<string, Map<string, any>>,
    formByPlayerId: Map<string, number>,
    minElo: number,
    maxElo: number,
  ): TeamMetrics {
    const avgElo = team.reduce((sum, p) => sum + p.elo, 0) / team.length;

    const avgWinRate =
      team.reduce((sum, p) => {
        const total = p.totalMatchesPlayed;
        return sum + (total > 0 ? (p.winCount + p.drawCount * 0.5) / total : 0);
      }, 0) / team.length;

    const recentForm =
      team.reduce((sum, p) => sum + (formByPlayerId.get(p.id) ?? 0.5), 0) / team.length;

    const synergyScore = this.calculateTeamSynergy(team, synergyMatrix);

    const victoryProbability = this.calculateVictoryProbability(
      avgElo,
      avgWinRate,
      recentForm,
      synergyScore,
      minElo,
      maxElo,
    );

    return { avgElo, avgWinRate, recentForm, synergyScore, victoryProbability };
  }

  private calculatePlayerRecentForm(player: Player, allMatches: any[]): number {
    const playerMatches = allMatches
      .filter(
        (m) =>
          m.teamA.players.some((p: any) => p.id === player.id) ||
          m.teamB.players.some((p: any) => p.id === player.id),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, FORM_DECAY_WEIGHTS.length);

    if (playerMatches.length === 0) return 0.5;

    let weightedSum = 0;
    let totalWeight = 0;

    for (let i = 0; i < playerMatches.length; i++) {
      const match = playerMatches[i];
      const weight = FORM_DECAY_WEIGHTS[i];
      const isInTeamA = match.teamA.players.some((p: any) => p.id === player.id);
      const won = (isInTeamA && match.winner === 'A') || (!isInTeamA && match.winner === 'B');
      const draw = match.winner === 'draw';

      weightedSum += (won ? 1 : draw ? 0.5 : 0) * weight;
      totalWeight += weight;
    }

    return weightedSum / totalWeight;
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
          // winRate ya tiene prior bayesiano, incluimos todas las duplas
          totalSynergy += synergyMatrix.get(p1.id)!.get(p2.id).winRate;
          pairCount++;
        }
      }
    }

    return pairCount > 0 ? totalSynergy / pairCount : 0.5;
  }

  private calculateVictoryProbability(
    avgElo: number,
    avgWinRate: number,
    recentForm: number,
    synergyScore: number,
    minElo: number,
    maxElo: number,
  ): number {
    const eloRange = maxElo - minElo;
    // Normalización dinámica: si todos tienen el mismo ELO → 0.5 neutral
    const normalizedElo = eloRange > 0 ? (avgElo - minElo) / eloRange : 0.5;

    return normalizedElo * 0.4 + avgWinRate * 0.3 + recentForm * 0.2 + synergyScore * 0.1;
  }

  private calculateBalanceScore(teamAMetrics: TeamMetrics, teamBMetrics: TeamMetrics): number {
    // Solo la diferencia de victoryProbability — ya agrega ELO, winRate, form y sinergia
    // Evita el double-counting de sumar también las diferencias individuales
    return Math.abs(teamAMetrics.victoryProbability - teamBMetrics.victoryProbability);
  }

  private detectProblematicPairs(
    teamA: Player[],
    teamB: Player[],
    synergyMatrix: Map<string, Map<string, any>>,
  ): string[] {
    const warnings: string[] = [];
    const threshold = 0.3;

    const checkTeam = (team: Player[], teamName: string) => {
      for (let i = 0; i < team.length; i++) {
        for (let j = i + 1; j < team.length; j++) {
          const p1 = team[i];
          const p2 = team[j];

          if (synergyMatrix.has(p1.id) && synergyMatrix.get(p1.id)?.has(p2.id)) {
            const stats = synergyMatrix.get(p1.id)!.get(p2.id);
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
}
