import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('matches')
export class MatchPersistence {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  matchDate!: string;

  @Column({ type: 'int', nullable: true })
  goalDifference!: number;

  @Column({ type: 'text', nullable: true })
  teamWinner!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}
