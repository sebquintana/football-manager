import { MatchPersistence } from './match.entity';
import { PlayerPersistence } from './player.entity';
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('match_players')
export class MatchPlayerPersistence {
  @PrimaryColumn('uuid')
  matchId!: string;

  @PrimaryColumn('uuid')
  playerId!: string;

  @ManyToOne(() => MatchPersistence, (match: MatchPersistence) => match.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match!: MatchPersistence;

  @ManyToOne(() => PlayerPersistence, (player: PlayerPersistence) => player.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'player_id' })
  player!: PlayerPersistence;

  @Column({ type: 'char', length: 1 })
  team!: string;

  @Column({ type: 'int' })
  eloBefore!: number;

  @Column({ type: 'int' })
  eloAfter!: number;
}
