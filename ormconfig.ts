import { MatchPlayerEntity } from './src/infrastructure/adapters/persistence/typeorm/entities/match-player.entity';
import { MatchEntity } from './src/infrastructure/adapters/persistence/typeorm/entities/match.entity';
import { PlayerEntity } from './src/infrastructure/adapters/persistence/typeorm/entities/player.entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'your_username',
  password: 'your_password',
  database: 'football_manager',
  entities: [PlayerEntity, MatchEntity, MatchPlayerEntity],
  synchronize: false,
};

export default config;
