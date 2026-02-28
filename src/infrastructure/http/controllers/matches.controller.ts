import { Controller, Get, Query } from '@nestjs/common';
import { GetMatchesSummaryUseCase } from '@application/use-cases/get-matches-summary.usecase';

@Controller('matches')
export class MatchesController {
  constructor(private readonly getMatchesSummaryUseCase: GetMatchesSummaryUseCase) {}

  @Get('summary')
  async getSummary(@Query('season') season?: string) {
    return this.getMatchesSummaryUseCase.execute(season ? parseInt(season, 10) : undefined);
  }
}
