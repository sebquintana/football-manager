import { Module } from '@nestjs/common';
import { PlayerController } from '@infrastructure/http/controllers/player.controller';
import { MatchController } from '@infrastructure/http/controllers/match.controller';

import { CreatePlayerUseCase } from '@application/use-cases/create-player.usecase';
import { GetAllPlayersUseCase } from '@application/use-cases/get-all-players.usecase';
import { CreateMatchUseCase } from '@application/use-cases/create-match.usecase';

@Module({
  imports: [
  ],
  controllers: [PlayerController, MatchController],
  providers: [
    CreatePlayerUseCase,
    GetAllPlayersUseCase,
    CreateMatchUseCase,
  ],
})
export class AppModule {}
