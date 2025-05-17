import { Injectable } from '@nestjs/common';
import { MatchResultService } from '@domain/services/match-result.service';

@Injectable()
export class SaveMatchResultUseCase {
  constructor(private readonly matchResultService: MatchResultService) {}

  async execute(matchData: {
    teamWinner: 'A' | 'B' | 'EMPATE';
    goalDifference: number;
    players: { id: string; team: 'A' | 'B'; elo: number }[];
  }): Promise<void> {
    await this.matchResultService.saveMatchResult(matchData);
  }
}
