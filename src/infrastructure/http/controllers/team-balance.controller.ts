import { Body, Controller, Post } from '@nestjs/common';
import { GenerateBalancedTeamsUseCase } from '@application/generate-balanced-teams.usecase';

@Controller('teams')
export class TeamBalanceController {
  constructor(private readonly generateBalancedTeamsUseCase: GenerateBalancedTeamsUseCase) {}

  @Post('balance')
  async generateBalancedTeams(@Body() playerNames: string[]) {
        return await this.generateBalancedTeamsUseCase.execute(playerNames);
  }
}
