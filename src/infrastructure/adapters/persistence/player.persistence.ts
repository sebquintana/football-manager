import { Injectable } from '@nestjs/common';
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Injectable()
@Entity('players')
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

