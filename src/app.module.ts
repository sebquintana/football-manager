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
import { UpdatePlayerEloUseCase } from '@application/use-cases/update-player-elo.usecase';
import { SavePendingMatchUseCase } from '@application/use-cases/save-pending-match.usecase';
import { GetPendingMatchUseCase } from '@application/use-cases/get-pending-match.usecase';
import { ConfirmPendingMatchUseCase } from '@application/use-cases/confirm-pending-match.usecase';
import { DeletePendingMatchUseCase } from '@application/use-cases/delete-pending-match.usecase';

import { PlayerEntity } from '@infrastructure/adapters/persistence/typeorm/entities/player.entity';
import { MatchEntity } from '@infrastructure/adapters/persistence/typeorm/entities/match.entity';
import { MatchPlayerEntity } from '@infrastructure/adapters/persistence/typeorm/entities/match-player.entity';
import { PendingMatchEntity } from '@infrastructure/adapters/persistence/typeorm/entities/pending-match.entity';
import { TypeOrmPlayerRepository } from '@infrastructure/adapters/persistence/typeorm/player.repository.typeorm';
import { TypeOrmMatchRepository } from '@infrastructure/adapters/persistence/typeorm/match.repository.typeorm';
import { TypeOrmPendingMatchRepository } from '@infrastructure/adapters/persistence/typeorm/typeorm-pending-match.repository';
import { NoOpTeamRepository } from '@infrastructure/adapters/persistence/typeorm/team.repository.noop';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      entities: [PlayerEntity, MatchEntity, MatchPlayerEntity, PendingMatchEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([PlayerEntity, MatchEntity, MatchPlayerEntity, PendingMatchEntity]),
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
    UpdatePlayerEloUseCase,
    SavePendingMatchUseCase,
    GetPendingMatchUseCase,
    ConfirmPendingMatchUseCase,
    DeletePendingMatchUseCase,
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
    {
      provide: 'PendingMatchRepository',
      useClass: TypeOrmPendingMatchRepository,
    },
  ],
})
export class AppModule {}
