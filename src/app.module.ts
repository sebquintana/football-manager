import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlayerPersistence } from '@infrastructure/adapters/persistence/player.persistence';
import { MatchPersistence } from '@infrastructure/adapters/persistence/match.persistence';
import { TeamPersistence } from '@infrastructure/adapters/persistence/team.persistence';

import { PlayerController } from '@infrastructure/http/controllers/player.controller';
import { MatchController } from '@infrastructure/http/controllers/match.controller';

import { TypeOrmPlayerRepository } from '@infrastructure/adapters/persistence/typeorm-player-repository';
import { TypeOrmMatchRepository } from '@infrastructure/adapters/persistence/typeorm-match-repository';

import { CreatePlayerUseCase } from '@application/use-cases/create-player.usecase';
import { GetAllPlayersUseCase } from '@application/use-cases/get-all-players.usecase';
import { CreateMatchUseCase } from '@application/use-cases/create-match.usecase';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'your_user',
      password: 'your_password',
      database: 'football_manager',
      entities: [PlayerPersistence, MatchPersistence, TeamPersistence],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([PlayerPersistence, MatchPersistence, TeamPersistence]),
  ],
  controllers: [PlayerController, MatchController],
  providers: [
    CreatePlayerUseCase,
    GetAllPlayersUseCase,
    CreateMatchUseCase,
    {
      provide: 'PlayerRepository',
      useClass: TypeOrmPlayerRepository,
    },
    {
      provide: 'MatchRepository',
      useClass: TypeOrmMatchRepository,
    },
  ],
})
export class AppModule {}
