import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlayerController } from '@infrastructure/http/controllers/player.controller';
import { PlayerPersistence } from '@infrastructure/adapters/persistence/player.persistence';
import { TypeOrmPlayerRepository } from '@infrastructure/adapters/persistence/typeorm-player-repository';

import { CreatePlayerUseCase } from '@application/use-cases/create-player.usecase';
import { GetAllPlayersUseCase } from '@application/use-cases/get-all-players.usecase';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'your_user',
      password: 'your_password',
      database: 'football_manager',
      entities: [PlayerPersistence],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([PlayerPersistence]),
  ],
  controllers: [PlayerController],
  providers: [
    CreatePlayerUseCase,
    GetAllPlayersUseCase,
    {
      provide: 'PlayerRepository',
      useClass: TypeOrmPlayerRepository,
    },
  ],
})
export class AppModule {}
