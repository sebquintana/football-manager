import { Module } from '@nestjs/common';
import { PlayerController } from '@infrastructure/http/controllers/player.controller';
import { MatchController } from '@infrastructure/http/controllers/match.controller';
import { TeamBalanceController } from '@infrastructure/http/controllers/team-balance.controller';

import { CreatePlayerUseCase } from '@application/use-cases/create-player.usecase';
import { GetAllPlayersUseCase } from '@application/use-cases/get-all-players.usecase';
import { CreateMatchUseCase } from '@application/use-cases/create-match.usecase';
import { GenerateBalancedTeamsUseCase } from '@application/use-cases/generate-balanced-teams.usecase';

import { FilePlayerRepository } from '@infrastructure/adapters/persistence/files/player.repository.file'
import { FileTeamRepository } from '@infrastructure/adapters/persistence/files/team.repository.file'
import { FileMatchRepository } from '@infrastructure/adapters/persistence/files/match.repository.file'

@Module({
  imports: [
  ],
  controllers: [PlayerController, MatchController, TeamBalanceController],
  providers: [
    CreatePlayerUseCase,
    GetAllPlayersUseCase,
    CreateMatchUseCase,
    GenerateBalancedTeamsUseCase,
    {
      provide: 'PlayerRepository',
      useClass: FilePlayerRepository,
    },
    {
      provide: 'MatchRepository',
      useClass: FileMatchRepository,
    },
    {
      provide: 'TeamRepository',
      useClass: FileTeamRepository,
    },
  ],
})
export class AppModule {}
