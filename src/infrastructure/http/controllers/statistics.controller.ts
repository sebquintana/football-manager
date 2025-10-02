import { Controller, Get } from '@nestjs/common';
import { GetGeneralStatisticsUseCase } from '@application/use-cases/get-general-statistics.usecase';
import { GeneralStatisticsDto } from '@application/dto/general-statistics.response.dto';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly getGeneralStatisticsUseCase: GetGeneralStatisticsUseCase) {}

  @Get('general')
  async getGeneralStatistics(): Promise<GeneralStatisticsDto> {
    return this.getGeneralStatisticsUseCase.execute();
  }
}
