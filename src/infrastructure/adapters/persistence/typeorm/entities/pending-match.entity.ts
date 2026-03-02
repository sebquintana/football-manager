import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('pending_matches')
export class PendingMatchEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('simple-array')
  teamANames!: string[];

  @Column('simple-array')
  teamBNames!: string[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
