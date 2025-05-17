import { Controller, Post, Body } from '@nestjs/common';
import { SaveMatchResultUseCase } from '@application/save-match-result.usecase';

@Controller('match')
export class MatchResultController {
  constructor(private readonly saveMatchResultUseCase: SaveMatchResultUseCase) {}

  @Post('result')
  async saveMatchResult(
    @Body()
    body: {
      teamWinner: 'A' | 'B' | 'EMPATE';
      goalDifference: number;
      players: { id: string; team: 'A' | 'B'; elo: number }[];
    },
  ): Promise<void> {
    await this.saveMatchResultUseCase.execute(body);
  }
}
