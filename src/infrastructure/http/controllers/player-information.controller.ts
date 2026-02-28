import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetPlayerInformationUseCase } from '@application/use-cases/get-player-information.usecase';

@Controller('players')
export class PlayerInformationController {
  constructor(private readonly getPlayerInformationUseCase: GetPlayerInformationUseCase) {}

  @Get(':playerName')
  async getPlayerInformation(
    @Param('playerName') playerName: string,
    @Query('season') season?: string,
  ) {
    return this.getPlayerInformationUseCase.execute(
      playerName,
      season ? parseInt(season, 10) : undefined,
    );
  }
}
