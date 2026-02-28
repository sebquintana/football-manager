import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { MatchEntity } from './match.entity';
import { PlayerEntity } from './player.entity';

@Entity('match_players')
export class MatchPlayerEntity {
  @PrimaryColumn('uuid', { name: 'match_id' })
  matchId!: string;

  @PrimaryColumn('uuid', { name: 'player_id' })
  playerId!: string;

  @ManyToOne(() => MatchEntity, (m) => m.matchPlayers)
  @JoinColumn({ name: 'match_id' })
  match!: MatchEntity;

  @ManyToOne(() => PlayerEntity)
  @JoinColumn({ name: 'player_id' })
  player!: PlayerEntity;

  @Column({ length: 1 })
  team!: string;

  @Column('float', { name: 'elo_before' })
  eloBefore!: number;

  @Column('float', { name: 'elo_after' })
  eloAfter!: number;
}
