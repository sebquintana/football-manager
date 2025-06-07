export interface MatchSummaryDto {
  id: string;
  date: Date;
  winner: 'A' | 'B' | 'draw';
  goalDifference: number;
  teamAPlayers: string[];
  teamBPlayers: string[];
}
