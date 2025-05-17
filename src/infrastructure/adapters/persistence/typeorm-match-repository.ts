import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchPersistence } from './match.entity';
import { Match } from '@domain/entities/match';
import { MatchRepository } from '@domain/ports/match.repository';
import { Repository } from 'typeorm/repository/Repository';

@Injectable()
export class TypeOrmMatchRepository implements MatchRepository {
  constructor(
    @InjectRepository(MatchPersistence)
    private readonly matchRepository: Repository<Match>,
  ) {}

  async saveMatch(match: Match): Promise<Match> {
    return this.matchRepository.save(this.toPersistence(match));
  }

  toPersistence(match: Match): MatchPersistence {
    return {
      id: match.id,
      matchDate: match.matchDate,
      goalDifference: match.goalDifference,
      teamWinner: match.teamWinner,
      createdAt: match.createdAt,
    };
  }
}
