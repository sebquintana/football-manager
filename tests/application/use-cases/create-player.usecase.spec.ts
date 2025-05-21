import { CreatePlayerUseCase } from '@application/use-cases/create-player.usecase';
import { CreatePlayerDto } from '@application/dto/create-player.dto';
import { PlayerRepository } from '@domain/ports/player.repository';
import { Player } from '@domain/entities/player';

describe('CreatePlayerUseCase', () => {
  let useCase: CreatePlayerUseCase;
  let mockRepo: jest.Mocked<PlayerRepository>;

  beforeEach(() => {
    mockRepo = {
      save: jest.fn(),
      findAll: jest.fn(),
    };
    useCase = new CreatePlayerUseCase(mockRepo);
  });

  it('should create a player with given name and initialElo', async () => {
    const dto: CreatePlayerDto = {
      name: 'Axel',
      initialElo: 950,
    };

    mockRepo.save.mockImplementation(async (player: Player) => player);

    const result = await useCase.execute(dto);

    expect(result).toBeInstanceOf(Player);
    expect(result.name).toBe('Axel');
    expect(result.elo).toBe(950);
    expect(result.initialElo).toBe(950);
    expect(result.totalMatchesPlayed).toBe(0);
    expect(mockRepo.save).toHaveBeenCalledWith(expect.any(Player));
  });
});
