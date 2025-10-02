export interface AttendanceStats {
  highestAttendance: { players: string[]; rate: number };
  lowestAttendance: { players: string[]; rate: number };
  averageAttendance: number;
  totalMatches: number;
  activePlayers: number; // Players with >50% attendance
}

export interface EloStats {
  distribution: {
    range: string;
    count: number;
    players: string[];
  }[];
  biggestGainer: { players: string[]; gain: number };
  biggestLoser: { players: string[]; loss: number };
  mostConsistent: { player: string; variance: number };
  averageElo: number;
  eloRange: { min: number; max: number };
}

export interface GoalStats {
  averageGoalDifference: number;
  biggestWin: {
    difference: number;
    matchId: string;
    date: string;
    teams?: { teamA: string[]; teamB: string[] };
  };
  resultDistribution: {
    difference: number;
    count: number;
    percentage: number;
  }[];
  maxGoalDifference: number;
  closestMatches: number; // Matches with difference of 0-1
  blowouts: number; // Matches with difference >= 5
}

export interface ResultStats {
  totalMatches: number;
  decisiveWins: number; // Matches decided by 2+ goals
  narrowWins: number; // Matches decided by 1 goal
  draws: number; // Draw matches
  drawPercentage: number;
  competitiveBalance: number; // 0-1 score, higher = more competitive
  averageMatchIntensity: number; // Based on goal difference distribution
}

export interface StreakStats {
  longestWinStreak: { player: string; streak: number };
  longestLossStreak: { player: string; streak: number };
  mostStreaky: { player: string; variance: number }; // Player with highest streak variance
  mostConsistent: { player: string; variance: number }; // Player with lowest streak variance
}

export interface SynergyStats {
  bestDuos: {
    players: [string, string];
    winRate: number;
    matches: number;
  }[];
  worstDuos: {
    players: [string, string];
    winRate: number;
    matches: number;
  }[];
  mostCompatible: { player: string; averageSynergy: number };
  leastCompatible: { player: string; averageSynergy: number };
  teamImprovers: { player: string; teamImpact: number }[]; // Players who improve team performance
}

export class GeneralStatisticsDto {
  attendance!: AttendanceStats;
  elo!: EloStats;
  goals!: GoalStats;
  results!: ResultStats;
  streaks!: StreakStats;
  synergies!: SynergyStats;
  generatedAt!: string;
  totalPlayers!: number;
  totalMatches!: number;
}
