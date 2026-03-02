import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendingMatch, PendingMatchRepository } from '@domain/ports/pending-match.repository';
import { PendingMatchEntity } from './entities/pending-match.entity';

@Injectable()
export class TypeOrmPendingMatchRepository implements PendingMatchRepository {
  constructor(
    @InjectRepository(PendingMatchEntity)
    private readonly repo: Repository<PendingMatchEntity>,
  ) {}

  async save(pending: PendingMatch): Promise<PendingMatch> {
    await this.repo.save({
      id: pending.id,
      teamANames: pending.teamANames,
      teamBNames: pending.teamBNames,
      createdAt: pending.createdAt,
    });
    return pending;
  }

  async findLatest(): Promise<PendingMatch | null> {
    const entity = await this.repo.findOne({ order: { createdAt: 'DESC' } });
    if (!entity) return null;
    return { id: entity.id, teamANames: entity.teamANames, teamBNames: entity.teamBNames, createdAt: entity.createdAt };
  }

  async findById(id: string): Promise<PendingMatch | null> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) return null;
    return { id: entity.id, teamANames: entity.teamANames, teamBNames: entity.teamBNames, createdAt: entity.createdAt };
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
