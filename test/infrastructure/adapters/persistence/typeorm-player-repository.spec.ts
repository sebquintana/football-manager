import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Player } from '@domain/entities/player.entity';
import { PlayerPersistence } from '@infrastructure/adapters/persistence/player.persistence';
import { TypeOrmPlayerRepository } from '@infrastructure/adapters/persistence/typeorm-player-repository';

const mockPlayerPersistence = {
  id: '1',
  name: 'John Doe',
  elo: 1200,
  initialElo: 1000,
};

const mockPlayer = new Player('1', 'John Doe', 1200, 1000);

describe('TypeOrmPlayerRepository', () => {
  let repository: TypeOrmPlayerRepository;
  let playerRepositoryMock: jest.Mocked<Repository<PlayerPersistence>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmPlayerRepository,
        {
          provide: getRepositoryToken(PlayerPersistence),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<TypeOrmPlayerRepository>(TypeOrmPlayerRepository);
    playerRepositoryMock = module.get(getRepositoryToken(PlayerPersistence));
  });

  it('should find a player by id', async () => {
    playerRepositoryMock.findOne.mockResolvedValue(mockPlayerPersistence);

    const result = await repository.findById('1');

    expect(playerRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result).toEqual(mockPlayer);
  });

  it('should find a player by name', async () => {
    playerRepositoryMock.findOne.mockResolvedValue(mockPlayerPersistence);

    const result = await repository.findByName('John Doe');

    expect(playerRepositoryMock.findOne).toHaveBeenCalledWith({ where: { name: 'John Doe' } });
    expect(result).toEqual(mockPlayer);
  });

  it('should save a player', async () => {
    playerRepositoryMock.save.mockResolvedValue(mockPlayerPersistence);

    await repository.save(mockPlayer);

    expect(playerRepositoryMock.save).toHaveBeenCalledWith({
      id: '1',
      name: 'John Doe',
      elo: 1200,
      initialElo: 1000,
    });
  });
});
