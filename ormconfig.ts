export default {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'your_username',
  password: 'your_password',
  database: 'team_balancer',
  entities: [__dirname + '/domain/entities/*.entity{.ts,.js}'],
  synchronize: true,
};