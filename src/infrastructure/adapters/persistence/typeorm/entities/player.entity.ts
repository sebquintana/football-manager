import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('players')
export class PlayerEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column('float')
  elo!: number;

  @Column('float', { name: 'initial_elo' })
  initialElo!: number;

  @Column('int', { name: 'total_matches_played', default: 0 })
  totalMatchesPlayed!: number;

  @Column('int', { name: 'win_count', default: 0 })
  winCount!: number;

  @Column('int', { name: 'loss_count', default: 0 })
  lossCount!: number;

  @Column('int', { name: 'draw_count', default: 0 })
  drawCount!: number;

  @Column('int', { name: 'goals_for', default: 0 })
  goalsFor!: number;

  @Column('int', { name: 'goals_against', default: 0 })
  goalsAgainst!: number;

  @Column('jsonb', { default: [] })
  history!: {
    oldElo: number;
    newElo: number;
    changedAt: string;
    matchId?: string;
  }[];
}
