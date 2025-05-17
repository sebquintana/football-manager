import { v4 as uuidv4 } from 'uuid';
import { Inject, Injectable } from '@nestjs/common';
import { Match } from '@domain/entities/match';
import { MatchRepository } from '@domain/ports/match.repository';

@Injectable()
export class MatchService {
  constructor(
    @Inject('MatchRepository')
    private readonly matchRepository: MatchRepository,
  ) {}

  async saveMatch(matchDate: string, teamWinner: string, goalDifference: number): Promise<Match> {
    // TODO: mover uuidv4 a un puetrto y un adapter
    return this.matchRepository.saveMatch(
      Match.create(uuidv4(), matchDate, goalDifference, teamWinner),
    );
  }
}
