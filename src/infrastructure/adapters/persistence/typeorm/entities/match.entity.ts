import { Column, Entity, PrimaryColumn } from 'typeorm';

interface PlayerSnapshot {
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
  history: { oldElo: number; newElo: number; changedAt: string; matchId?: string }[];
}

interface TeamSnapshot {
  id: string;
  players: PlayerSnapshot[];
}

@Entity('matches')
export class MatchEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('timestamptz')
  date!: Date;

  @Column()
  winner!: string;

  @Column('int', { name: 'goal_difference', default: 0 })
  goalDifference!: number;

  @Column('jsonb', { name: 'team_a' })
  teamA!: TeamSnapshot;

  @Column('jsonb', { name: 'team_b' })
  teamB!: TeamSnapshot;
}
