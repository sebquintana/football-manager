import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { MatchPlayerEntity } from './match-player.entity';

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

  @OneToMany(() => MatchPlayerEntity, (mp) => mp.match, { cascade: true, eager: false })
  matchPlayers!: MatchPlayerEntity[];
}
