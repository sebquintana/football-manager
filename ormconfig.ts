import { PlayerPersistence } from '@infrastructure/adapters/persistence/player.entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'your_username',
  password: 'your_password',
  database: 'football_manager',
  entities: [PlayerPersistence],
  synchronize: true, // Set to false in production
};

export default config;
