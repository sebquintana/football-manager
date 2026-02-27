import { Controller, Post, Body } from '@nestjs/common';
import { GenerateBalancedTeamsUseCase } from '@application/use-cases/generate-balanced-teams.usecase';
import { GenerateBalancedTeamsDto } from '@application/dto/generate-balanced-teams.dto';

@Controller('teams')
export class TeamBalanceController {
  constructor(private readonly generateBalancedTeamsUseCase: GenerateBalancedTeamsUseCase) {}

  @Post('balanced')
  async generateBalanced(@Body() dto: GenerateBalancedTeamsDto) {
    return this.generateBalancedTeamsUseCase.execute(dto);
  }
}
