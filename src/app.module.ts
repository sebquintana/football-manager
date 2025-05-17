import { Module } from '@nestjs/common';
import { TeamBalanceController } from './infrastructure/http/controllers/team-balance.controller';
import { TeamBalanceService } from './domain/services/team-balance.service';
import { GenerateBalancedTeamsUseCase } from './application/generate-balanced-teams.usecase';
import { DatabaseSeeder } from './infrastructure/adapters/persistence/database-seeder';
import { TypeOrmPlayerRepository } from './infrastructure/adapters/persistence/typeorm-player-repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerPersistence } from './infrastructure/adapters/persistence/player.entity';
import config from '../ormconfig';
import { MatchController } from './infrastructure/http/controllers/match.controller';
import { SaveMatchUseCase } from './application/save-match.usecase';
import { MatchService } from './domain/services/match.service';
import { TypeOrmMatchRepository } from './infrastructure/adapters/persistence/typeorm-match-repository';
import { MatchPersistence } from './infrastructure/adapters/persistence/match.entity';
import { MatchPlayerService } from './domain/services/match-player.service';
import { TypeOrmMatchPlayerRepository } from './infrastructure/adapters/persistence/typeorm-match-player-repository';
import { MatchPlayerPersistence } from './infrastructure/adapters/persistence/match-player.entity';
import { MatchResultController } from './infrastructure/http/controllers/match-result.controller';
import { SaveMatchResultUseCase } from './application/save-match-result.usecase';
import { MatchResultService } from './domain/services/match-result.service';
import { PlayerService } from '@domain/services/player.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    TypeOrmModule.forFeature([PlayerPersistence, MatchPersistence, MatchPlayerPersistence]),
  ],
  controllers: [TeamBalanceController, MatchController, MatchResultController],
  providers: [
    TeamBalanceService,
    GenerateBalancedTeamsUseCase,
    DatabaseSeeder,
    SaveMatchUseCase,
    MatchService,
    MatchPlayerService,
    SaveMatchResultUseCase,
    MatchResultService,
    MatchService,
    PlayerService,
    {
      provide: 'PlayerRepository',
      useClass: TypeOrmPlayerRepository,
    },
    {
      provide: 'MatchRepository',
      useClass: TypeOrmMatchRepository,
    },
    {
      provide: 'MatchPlayerRepository',
      useClass: TypeOrmMatchPlayerRepository,
    },
  ],
})
export class AppModule {}
