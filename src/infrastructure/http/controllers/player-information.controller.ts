import { Controller, Get, Param } from '@nestjs/common';
import { GetPlayerInformationUseCase } from '@application/use-cases/get-player-information.usecase';

@Controller('players')
export class PlayerInformationController {
  constructor(private readonly getPlayerInformationUseCase: GetPlayerInformationUseCase) {}

  @Get(':playerName')
  async getPlayerInformation(@Param('playerName') playerName: string) {
    return this.getPlayerInformationUseCase.execute(playerName);
  }
}
