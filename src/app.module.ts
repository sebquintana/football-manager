import { Module } from '@nestjs/common';
import { TeamBalanceController } from './infrastructure/http/controllers/team-balance.controller';
import { TeamBalanceService } from './domain/services/team-balance.service';
import { GenerateBalancedTeamsUseCase } from './application/generate-balanced-teams.usecase';
import { DatabaseSeeder } from './infrastructure/adapters/persistence/database-seeder';
import { TypeOrmPlayerRepository } from './infrastructure/adapters/persistence/typeorm-player-repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerPersistence } from './infrastructure/adapters/persistence/player.entity';
import config from '../ormconfig';

@Module({
  imports: [TypeOrmModule.forRoot(config), TypeOrmModule.forFeature([PlayerPersistence])],
  controllers: [TeamBalanceController],
  providers: [
    TeamBalanceService,
    GenerateBalancedTeamsUseCase,
    DatabaseSeeder,
    {
      provide: 'PlayerRepository',
      useClass: TypeOrmPlayerRepository,
    },
  ],
})
export class AppModule {}
