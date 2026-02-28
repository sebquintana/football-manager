import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerController } from '@infrastructure/http/controllers/player.controller';
import { MatchController } from '@infrastructure/http/controllers/match.controller';
import { TeamBalanceController } from '@infrastructure/http/controllers/team-balance.controller';
import { MatchesController } from '@infrastructure/http/controllers/matches.controller';
import { PlayerInformationController } from '@infrastructure/http/controllers/player-information.controller';
import { StatisticsController } from '@infrastructure/http/controllers/statistics.controller';

import { CreatePlayerUseCase } from '@application/use-cases/create-player.usecase';
import { GetAllPlayersUseCase } from '@application/use-cases/get-all-players.usecase';
import { CreateMatchUseCase } from '@application/use-cases/create-match.usecase';
import { GenerateBalancedTeamsUseCase } from '@application/use-cases/generate-balanced-teams.usecase';
import { GetMatchesSummaryUseCase } from '@application/use-cases/get-matches-summary.usecase';
import { GetPlayerInformationUseCase } from '@application/use-cases/get-player-information.usecase';
import { GetPlayersRankingUseCase } from '@application/use-cases/get-players-ranking.usecase';
import { GetGeneralStatisticsUseCase } from '@application/use-cases/get-general-statistics.usecase';

import { PlayerEntity } from '@infrastructure/adapters/persistence/typeorm/entities/player.entity';
import { MatchEntity } from '@infrastructure/adapters/persistence/typeorm/entities/match.entity';
import { MatchPlayerEntity } from '@infrastructure/adapters/persistence/typeorm/entities/match-player.entity';
import { TypeOrmPlayerRepository } from '@infrastructure/adapters/persistence/typeorm/player.repository.typeorm';
import { TypeOrmMatchRepository } from '@infrastructure/adapters/persistence/typeorm/match.repository.typeorm';
import { NoOpTeamRepository } from '@infrastructure/adapters/persistence/typeorm/team.repository.noop';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      entities: [PlayerEntity, MatchEntity, MatchPlayerEntity],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([PlayerEntity, MatchEntity, MatchPlayerEntity]),
  ],
  controllers: [
    PlayerController,
    MatchController,
    TeamBalanceController,
    MatchesController,
    PlayerInformationController,
    StatisticsController,
  ],
  providers: [
    CreatePlayerUseCase,
    GetAllPlayersUseCase,
    CreateMatchUseCase,
    GenerateBalancedTeamsUseCase,
    GetPlayersRankingUseCase,
    GetMatchesSummaryUseCase,
    GetPlayerInformationUseCase,
    GetGeneralStatisticsUseCase,
    {
      provide: 'PlayerRepository',
      useClass: TypeOrmPlayerRepository,
    },
    {
      provide: 'MatchRepository',
      useClass: TypeOrmMatchRepository,
    },
    {
      provide: 'TeamRepository',
      useClass: NoOpTeamRepository,
    },
  ],
})
export class AppModule {}
