import { Body, Controller, Post } from '@nestjs/common';
import { GenerateBalancedTeamsUseCase } from '@application/generate-balanced-teams.usecase';
import { PlayerNamesDTO } from './dto/players-names.dto';

@Controller('teams')
export class TeamBalanceController {
  constructor(private readonly generateBalancedTeamsUseCase: GenerateBalancedTeamsUseCase) {}

  @Post('balance')
  async generateBalancedTeams(@Body() playerNames: PlayerNamesDTO) {
    return await this.generateBalancedTeamsUseCase.execute(playerNames.names);
  }
}
