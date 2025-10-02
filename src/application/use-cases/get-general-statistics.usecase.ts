import { Inject, Injectable } from '@nestjs/common';
import { PlayerRepository } from '@domain/ports/player.repository';
import { MatchRepository } from '@domain/ports/match.repository';
import { GeneralStatisticsDto } from '../dto/general-statistics.response.dto';

@Injectable()
export class GetGeneralStatisticsUseCase {
  constructor(
    @Inject('PlayerRepository')
    private readonly playerRepository: PlayerRepository,
    @Inject('MatchRepository')
    private readonly matchRepository: MatchRepository,
  ) {}

  async execute(): Promise<GeneralStatisticsDto> {
    const players = await this.playerRepository.findAll();
    const matches = await this.matchRepository.findAll();

    // Filter active players (with at least 1 match)
    const activePlayers = players.filter((p) => p.totalMatchesPlayed > 0);

    return {
      attendance: this.calculateAttendanceStats(activePlayers, matches.length),
      elo: this.calculateEloStats(activePlayers),
      goals: this.calculateGoalStats(matches),
      results: this.calculateResultStats(matches),
      streaks: this.calculateStreakStats(activePlayers, matches),
      synergies: this.calculateSynergyStats(activePlayers, matches),
      generatedAt: new Date().toISOString(),
      totalPlayers: players.length,
      totalMatches: matches.length,
    };
  }

  private calculateAttendanceStats(players: any[], totalMatches: number) {
    if (players.length === 0 || totalMatches === 0) {
      return {
        highestAttendance: { players: ['N/A'], rate: 0 },
        lowestAttendance: { players: ['N/A'], rate: 0 },
        averageAttendance: 0,
        totalMatches,
        activePlayers: 0,
      };
    }

    const attendanceRates = players.map((p) => ({
      player: p.name,
      rate: Math.round((p.totalMatchesPlayed / totalMatches) * 100 * 100) / 100,
    }));

    attendanceRates.sort((a, b) => b.rate - a.rate);

    const averageAttendance = attendanceRates.reduce((sum, p) => sum + p.rate, 0) / players.length;
    const activePlayers = attendanceRates.filter((p) => p.rate > 50).length;

    // Find all players with highest attendance rate
    const highestRate = attendanceRates[0].rate;
    const playersWithHighestAttendance = attendanceRates
      .filter((p) => p.rate === highestRate)
      .map((p) => p.player);

    // Find all players with lowest attendance rate
    const lowestRate = attendanceRates[attendanceRates.length - 1].rate;
    const playersWithLowestAttendance = attendanceRates
      .filter((p) => p.rate === lowestRate)
      .map((p) => p.player);

    return {
      highestAttendance: { players: playersWithHighestAttendance, rate: highestRate },
      lowestAttendance: { players: playersWithLowestAttendance, rate: lowestRate },
      averageAttendance: Math.round(averageAttendance * 100) / 100,
      totalMatches,
      activePlayers,
    };
  }

  private calculateEloStats(players: any[]) {
    if (players.length === 0) {
      return {
        distribution: [],
        biggestGainer: { players: ['N/A'], gain: 0 },
        biggestLoser: { players: ['N/A'], loss: 0 },
        mostConsistent: { player: 'N/A', variance: 0 },
        averageElo: 0,
        eloRange: { min: 0, max: 0 },
      };
    }

    // ELO Distribution
    const eloRanges = [
      { min: 0, max: 900, range: '0-900' },
      { min: 900, max: 950, range: '900-950' },
      { min: 950, max: 1000, range: '950-1000' },
      { min: 1000, max: 1050, range: '1000-1050' },
      { min: 1050, max: 1100, range: '1050-1100' },
      { min: 1100, max: Infinity, range: '1100+' },
    ];

    const distribution = eloRanges
      .map((range) => ({
        range: range.range,
        count: players.filter((p) => p.elo >= range.min && p.elo < range.max).length,
        players: players.filter((p) => p.elo >= range.min && p.elo < range.max).map((p) => p.name),
      }))
      .filter((d) => d.count > 0);

    // Biggest gainer/loser
    const eloChanges = players.map((p) => ({
      player: p.name,
      change: p.elo - p.initialElo,
    }));

    eloChanges.sort((a, b) => b.change - a.change);

    // Find all players with biggest gain
    const biggestGain = eloChanges[0]?.change || 0;
    const playersWithBiggestGain = eloChanges
      .filter((p) => p.change === biggestGain)
      .map((p) => p.player);

    // Find all players with biggest loss
    const biggestLoss = eloChanges[eloChanges.length - 1]?.change || 0;
    const playersWithBiggestLoss = eloChanges
      .filter((p) => p.change === biggestLoss)
      .map((p) => p.player);

    const averageElo = players.reduce((sum, p) => sum + p.elo, 0) / players.length;
    const eloValues = players.map((p) => p.elo);

    return {
      distribution,
      biggestGainer: {
        players: playersWithBiggestGain,
        gain: Math.round(biggestGain),
      },
      biggestLoser: {
        players: playersWithBiggestLoss,
        loss: Math.round(Math.abs(biggestLoss)),
      },
      mostConsistent: { player: 'N/A', variance: 0 }, // Simplified for now
      averageElo: Math.round(averageElo),
      eloRange: { min: Math.min(...eloValues), max: Math.max(...eloValues) },
    };
  }

  private calculateGoalStats(matches: any[]) {
    if (matches.length === 0) {
      return {
        averageGoalDifference: 0,
        biggestWin: { difference: 0, matchId: 'N/A', date: 'N/A' },
        resultDistribution: [],
        maxGoalDifference: 0,
        closestMatches: 0,
        blowouts: 0,
      };
    }

    const goalDifferences = matches.map((m) => m.goalDifference);
    const averageGoalDifference =
      goalDifferences.reduce((sum, diff) => sum + diff, 0) / matches.length;

    // Find the biggest win
    const biggestWinMatch = matches.reduce(
      (biggest, current) => (current.goalDifference > biggest.goalDifference ? current : biggest),
      matches[0],
    );

    // Calculate result distribution
    const distributionMap = new Map<number, number>();
    goalDifferences.forEach((diff) => {
      distributionMap.set(diff, (distributionMap.get(diff) || 0) + 1);
    });

    const resultDistribution = Array.from(distributionMap.entries())
      .map(([difference, count]) => ({
        difference,
        count,
        percentage: Math.round((count / matches.length) * 100 * 100) / 100,
      }))
      .sort((a, b) => a.difference - b.difference); // Sort by goal difference

    const maxGoalDifference = Math.max(...goalDifferences);
    const closestMatches = matches.filter((m) => m.goalDifference <= 1).length;
    const blowouts = matches.filter((m) => m.goalDifference >= 5).length;

    return {
      averageGoalDifference: Math.round(averageGoalDifference * 100) / 100,
      biggestWin: {
        difference: biggestWinMatch.goalDifference,
        matchId: biggestWinMatch.id,
        date: biggestWinMatch.date.toISOString().split('T')[0],
        teams: {
          teamA: biggestWinMatch.teamA.players.map((p: any) => p.name),
          teamB: biggestWinMatch.teamB.players.map((p: any) => p.name),
        },
      },
      resultDistribution,
      maxGoalDifference,
      closestMatches,
      blowouts,
    };
  }

  private calculateResultStats(matches: any[]) {
    if (matches.length === 0) {
      return {
        totalMatches: 0,
        decisiveWins: 0,
        narrowWins: 0,
        draws: 0,
        drawPercentage: 0,
        competitiveBalance: 0,
        averageMatchIntensity: 0,
      };
    }

    const totalMatches = matches.length;
    const draws = matches.filter((m) => m.winner === 'draw').length;
    const decisiveWins = matches.filter((m) => m.winner !== 'draw' && m.goalDifference >= 2).length;
    const narrowWins = matches.filter((m) => m.winner !== 'draw' && m.goalDifference === 1).length;

    const drawPercentage = Math.round((draws / totalMatches) * 100 * 100) / 100;

    // Competitive balance: higher score = more competitive matches
    // Based on how many matches are close (0-2 goal difference)
    const competitiveMatches = matches.filter((m) => m.goalDifference <= 2).length;
    const competitiveBalance = Math.round((competitiveMatches / totalMatches) * 100) / 100;

    // Average match intensity: inverse of average goal difference (normalized)
    const avgGoalDiff = matches.reduce((sum, m) => sum + m.goalDifference, 0) / totalMatches;
    const averageMatchIntensity = Math.round((1 / (1 + avgGoalDiff)) * 100) / 100;

    return {
      totalMatches,
      decisiveWins,
      narrowWins,
      draws,
      drawPercentage,
      competitiveBalance,
      averageMatchIntensity,
    };
  }

  private calculateStreakStats(players: any[], matches: any[]) {
    if (players.length === 0 || matches.length === 0) {
      return {
        longestWinStreak: { player: 'N/A', streak: 0 },
        longestLossStreak: { player: 'N/A', streak: 0 },
        mostStreaky: { player: 'N/A', variance: 0 },
        mostConsistent: { player: 'N/A', variance: 0 },
      };
    }

    const playerStreakData = [];

    for (const player of players) {
      // Find all matches this player participated in
      const playerMatches = matches
        .filter(
          (m) =>
            m.teamA.players.some((p: any) => p.id === player.id) ||
            m.teamB.players.some((p: any) => p.id === player.id),
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (playerMatches.length === 0) continue;

      // Calculate streaks for this player
      const streaks = this.calculatePlayerStreaks(player, playerMatches);
      playerStreakData.push({
        player: player.name,
        maxWinStreak: streaks.maxWinStreak,
        maxLossStreak: streaks.maxLossStreak,
        streakVariance: streaks.streakVariance,
      });
    }

    if (playerStreakData.length === 0) {
      return {
        longestWinStreak: { player: 'N/A', streak: 0 },
        longestLossStreak: { player: 'N/A', streak: 0 },
        mostStreaky: { player: 'N/A', variance: 0 },
        mostConsistent: { player: 'N/A', variance: 0 },
      };
    }

    // Find longest win streak
    const longestWinStreakPlayer = playerStreakData.reduce(
      (best, current) => (current.maxWinStreak > best.maxWinStreak ? current : best),
      playerStreakData[0],
    );

    // Find longest loss streak
    const longestLossStreakPlayer = playerStreakData.reduce(
      (worst, current) => (current.maxLossStreak > worst.maxLossStreak ? current : worst),
      playerStreakData[0],
    );

    // Find most streaky (highest variance)
    const mostStreakyPlayer = playerStreakData.reduce(
      (most, current) => (current.streakVariance > most.streakVariance ? current : most),
      playerStreakData[0],
    );

    // Find most consistent (lowest variance, but exclude 0 variance which means no streaks)
    const playersWithStreaks = playerStreakData.filter((p) => p.streakVariance > 0);
    const mostConsistentPlayer =
      playersWithStreaks.length > 0
        ? playersWithStreaks.reduce(
            (most, current) => (current.streakVariance < most.streakVariance ? current : most),
            playersWithStreaks[0],
          )
        : playerStreakData[0];

    return {
      longestWinStreak: {
        player: longestWinStreakPlayer.player,
        streak: longestWinStreakPlayer.maxWinStreak,
      },
      longestLossStreak: {
        player: longestLossStreakPlayer.player,
        streak: longestLossStreakPlayer.maxLossStreak,
      },
      mostStreaky: {
        player: mostStreakyPlayer.player,
        variance: Math.round(mostStreakyPlayer.streakVariance * 100) / 100,
      },
      mostConsistent: {
        player: mostConsistentPlayer.player,
        variance: Math.round(mostConsistentPlayer.streakVariance * 100) / 100,
      },
    };
  }

  private calculatePlayerStreaks(player: any, playerMatches: any[]) {
    let currentStreak = 0;
    let currentStreakType: 'win' | 'loss' | 'draw' | null = null;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    const allStreaks: number[] = [];

    for (const match of playerMatches) {
      const resultType = this.getPlayerResultInMatch(player, match);

      if (currentStreakType === resultType) {
        currentStreak++;
      } else {
        const streakResults = this.processStreakEnd(
          currentStreak,
          currentStreakType,
          allStreaks,
          maxWinStreak,
          maxLossStreak,
        );
        maxWinStreak = streakResults.maxWinStreak;
        maxLossStreak = streakResults.maxLossStreak;

        currentStreakType = resultType;
        currentStreak = 1;
      }
    }

    // Process final streak
    const finalStreakResults = this.processStreakEnd(
      currentStreak,
      currentStreakType,
      allStreaks,
      maxWinStreak,
      maxLossStreak,
    );
    maxWinStreak = finalStreakResults.maxWinStreak;
    maxLossStreak = finalStreakResults.maxLossStreak;

    const streakVariance = this.calculateStreakVariance(allStreaks);

    return {
      maxWinStreak,
      maxLossStreak,
      streakVariance,
    };
  }

  private getPlayerResultInMatch(player: any, match: any): 'win' | 'loss' | 'draw' {
    const isInTeamA = match.teamA.players.some((p: any) => p.id === player.id);
    const won = isInTeamA ? match.winner === 'A' : match.winner === 'B';
    const lost = isInTeamA ? match.winner === 'B' : match.winner === 'A';

    if (won) return 'win';
    if (lost) return 'loss';
    return 'draw';
  }

  private processStreakEnd(
    streak: number,
    streakType: 'win' | 'loss' | 'draw' | null,
    allStreaks: number[],
    currentMaxWinStreak: number,
    currentMaxLossStreak: number,
  ): { maxWinStreak: number; maxLossStreak: number } {
    if (streak > 0) {
      allStreaks.push(streak);
      if (streakType === 'win') {
        return {
          maxWinStreak: Math.max(currentMaxWinStreak, streak),
          maxLossStreak: currentMaxLossStreak,
        };
      } else if (streakType === 'loss') {
        return {
          maxWinStreak: currentMaxWinStreak,
          maxLossStreak: Math.max(currentMaxLossStreak, streak),
        };
      }
    }
    return { maxWinStreak: currentMaxWinStreak, maxLossStreak: currentMaxLossStreak };
  }

  private calculateStreakVariance(allStreaks: number[]): number {
    if (allStreaks.length <= 1) return 0;

    const mean = allStreaks.reduce((sum, streak) => sum + streak, 0) / allStreaks.length;
    const variance =
      allStreaks.reduce((sum, streak) => sum + Math.pow(streak - mean, 2), 0) / allStreaks.length;
    return Math.sqrt(variance);
  }

  private calculateSynergyStats(players: any[], matches: any[]) {
    if (players.length < 2 || matches.length === 0) {
      return {
        bestDuos: [],
        worstDuos: [],
        mostCompatible: { player: 'N/A', averageSynergy: 0 },
        leastCompatible: { player: 'N/A', averageSynergy: 0 },
        teamImprovers: [],
      };
    }

    const duoStats = new Map<
      string,
      { wins: number; total: number; playerA: string; playerB: string }
    >();
    const playerSynergies = new Map<
      string,
      { totalWins: number; totalMatches: number; partners: Set<string> }
    >();

    // Initialize player synergy tracking
    players.forEach((player) => {
      playerSynergies.set(player.name, { totalWins: 0, totalMatches: 0, partners: new Set() });
    });

    // Analyze matches
    matches.forEach((match) => {
      this.processMatchForSynergy(match, duoStats, playerSynergies);
    });

    return this.buildSynergyResults(duoStats, playerSynergies);
  }

  private processMatchForSynergy(
    match: any,
    duoStats: Map<string, { wins: number; total: number; playerA: string; playerB: string }>,
    playerSynergies: Map<
      string,
      { totalWins: number; totalMatches: number; partners: Set<string> }
    >,
  ) {
    const teamAPlayers = match.teamA.players.map((p: any) => p.name);
    const teamBPlayers = match.teamB.players.map((p: any) => p.name);
    const teamAWon = match.winner === 'A';
    const teamBWon = match.winner === 'B';

    this.processTeamDuos(teamAPlayers, teamAWon, duoStats, playerSynergies);
    this.processTeamDuos(teamBPlayers, teamBWon, duoStats, playerSynergies);
  }

  private processTeamDuos(
    teamPlayers: string[],
    teamWon: boolean,
    duoStats: Map<string, { wins: number; total: number; playerA: string; playerB: string }>,
    playerSynergies: Map<
      string,
      { totalWins: number; totalMatches: number; partners: Set<string> }
    >,
  ) {
    for (let i = 0; i < teamPlayers.length; i++) {
      for (let j = i + 1; j < teamPlayers.length; j++) {
        const playerA = teamPlayers[i];
        const playerB = teamPlayers[j];
        const duoKey = [playerA, playerB].sort((a, b) => a.localeCompare(b)).join('|');

        this.updateDuoStats(duoKey, playerA, playerB, teamWon, duoStats);
        this.updatePlayerSynergies(playerA, playerB, teamWon, playerSynergies);
      }
    }
  }

  private updateDuoStats(
    duoKey: string,
    playerA: string,
    playerB: string,
    teamWon: boolean,
    duoStats: Map<string, { wins: number; total: number; playerA: string; playerB: string }>,
  ) {
    if (!duoStats.has(duoKey)) {
      duoStats.set(duoKey, { wins: 0, total: 0, playerA, playerB });
    }

    const duo = duoStats.get(duoKey)!;
    duo.total++;
    if (teamWon) duo.wins++;
  }

  private updatePlayerSynergies(
    playerA: string,
    playerB: string,
    teamWon: boolean,
    playerSynergies: Map<
      string,
      { totalWins: number; totalMatches: number; partners: Set<string> }
    >,
  ) {
    const playerASynergy = playerSynergies.get(playerA)!;
    const playerBSynergy = playerSynergies.get(playerB)!;

    playerASynergy.totalMatches++;
    playerBSynergy.totalMatches++;
    playerASynergy.partners.add(playerB);
    playerBSynergy.partners.add(playerA);

    if (teamWon) {
      playerASynergy.totalWins++;
      playerBSynergy.totalWins++;
    }
  }

  private buildSynergyResults(
    duoStats: Map<string, { wins: number; total: number; playerA: string; playerB: string }>,
    playerSynergies: Map<
      string,
      { totalWins: number; totalMatches: number; partners: Set<string> }
    >,
  ) {
    // Convert duo stats to arrays with win rates (minimum 3 matches)
    const duosWithWinRates = Array.from(duoStats.entries())
      .filter(([_, stats]) => stats.total >= 3)
      .map(([duoKey, stats]) => ({
        players: [stats.playerA, stats.playerB] as [string, string],
        winRate: Math.round((stats.wins / stats.total) * 100 * 100) / 100,
        matches: stats.total,
      }))
      .sort((a, b) => b.winRate - a.winRate);

    const bestDuos = duosWithWinRates.slice(0, 3);
    const worstDuos = duosWithWinRates.slice(-3).reverse();

    // Calculate individual player synergy rates
    const playerSynergyRates = Array.from(playerSynergies.entries())
      .filter(([_, synergy]) => synergy.totalMatches >= 5)
      .map(([playerName, synergy]) => ({
        player: playerName,
        averageSynergy: Math.round((synergy.totalWins / synergy.totalMatches) * 100 * 100) / 100,
        partnersCount: synergy.partners.size,
      }))
      .sort((a, b) => b.averageSynergy - a.averageSynergy);

    const mostCompatible =
      playerSynergyRates.length > 0
        ? {
            player: playerSynergyRates[0].player,
            averageSynergy: playerSynergyRates[0].averageSynergy,
          }
        : { player: 'N/A', averageSynergy: 0 };

    const leastCompatible =
      playerSynergyRates.length > 0
        ? {
            player: playerSynergyRates[playerSynergyRates.length - 1].player,
            averageSynergy: playerSynergyRates[playerSynergyRates.length - 1].averageSynergy,
          }
        : { player: 'N/A', averageSynergy: 0 };

    const teamImprovers = playerSynergyRates
      .filter((p) => p.partnersCount >= 3)
      .slice(0, 5)
      .map((p) => ({
        player: p.player,
        teamImpact: Math.round(((p.averageSynergy * p.partnersCount) / 10) * 100) / 100,
      }));

    return {
      bestDuos,
      worstDuos,
      mostCompatible,
      leastCompatible,
      teamImprovers,
    };
  }
}
