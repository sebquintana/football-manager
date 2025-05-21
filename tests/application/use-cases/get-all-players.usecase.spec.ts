import { GetAllPlayersUseCase } from '@application/use-cases/get-all-players.usecase';
import { PlayerRepository } from '@domain/ports/player.repository';
import { Player } from '@domain/entities/player';

describe('GetAllPlayersUseCase', () => {
  let useCase: GetAllPlayersUseCase;
  let mockRepo: jest.Mocked<PlayerRepository>;

  beforeEach(() => {
    mockRepo = {
      save: jest.fn(),
      findAll: jest.fn(),
    };

    useCase = new GetAllPlayersUseCase(mockRepo);
  });

  it('should return all players from the repository', async () => {
    const players: Player[] = [
      new Player('1', 'Santi', 1028, 1028, 10, 6, 2, 2, 20, 10, []),
      new Player('2', 'Axel', 930, 930, 8, 2, 6, 0, 8, 18, []),
    ];

    mockRepo.findAll.mockResolvedValue(players);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Santi');
    expect(result[1].elo).toBe(930);
    expect(mockRepo.findAll).toHaveBeenCalled();
  });
});
