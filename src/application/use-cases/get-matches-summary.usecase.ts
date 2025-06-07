import { Inject, Injectable } from '@nestjs/common';
import { MatchRepository } from '@domain/ports/match.repository';
import { Match } from '@domain/entities/match';

export interface MatchSummaryDto {
  id: string;
  date: Date;
  winner: 'A' | 'B' | 'draw';
  goalDifference: number;
}

@Injectable()
export class GetMatchesSummaryUseCase {
  constructor(
    @Inject('MatchRepository')
    private readonly matchRepository: MatchRepository,
  ) {}

  async execute(): Promise<MatchSummaryDto[]> {
    const matches = await this.matchRepository.findAll();
    return matches.map((match) => ({
      id: match.id,
      date: match.date,
      winner: match.winner,
      goalDifference: match.goalDifference,
    }));
  }
}
