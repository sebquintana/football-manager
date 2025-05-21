@Module({
  imports: [TypeOrmModule.forFeature([PlayerPersistence])],
  controllers: [PlayerController],
  providers: [
    CreatePlayerUseCase,
    {
      provide: 'PlayerRepository',
      useClass: TypeOrmPlayerRepository,
    },
  ],
})
export class AppModule {}
