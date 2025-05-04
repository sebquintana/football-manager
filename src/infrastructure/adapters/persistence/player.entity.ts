import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('player')
@Index(['name'], { unique: true })
export class PlayerPersistence {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  elo: number = 1000;

  @Column({ name: 'initial_elo' })
  initialElo: number = 0;
}
