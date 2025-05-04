import { Module } from '@nestjs/common';
import { TeamBalanceController } from '@infrastructure/http/controllers/team-balance.controller';
import { TeamBalanceService } from '@domain/services/team-balance.service';
import { GenerateBalancedTeamsUseCase } from '@application/generate-balanced-teams.usecase';

@Module({
  controllers: [TeamBalanceController],
  providers: [TeamBalanceService, GenerateBalancedTeamsUseCase],
})
export class AppModule {}
