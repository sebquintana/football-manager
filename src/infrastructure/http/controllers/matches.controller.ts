import { Controller, Get } from '@nestjs/common';
import { GetMatchesSummaryUseCase } from '@application/use-cases/get-matches-summary.usecase';

@Controller('matches')
export class MatchesController {
  constructor(private readonly getMatchesSummaryUseCase: GetMatchesSummaryUseCase) {}

  @Get('summary')
  async getSummary() {
    return this.getMatchesSummaryUseCase.execute();
  }
}
