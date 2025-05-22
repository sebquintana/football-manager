import { GenerateBalancedTeamsUseCase } from '@application/use-cases/generate-balanced-teams.usecase';
import { PlayerRepository } from '@domain/ports/player.repository';
import { Player } from '@domain/entities/player';
import { GenerateBalancedTeamsDto } from '@application/dto/generate-balanced-teams.dto';

describe('GenerateBalancedTeamsUseCase', () => {
  let useCase: GenerateBalancedTeamsUseCase;
  let mockRepo: jest.Mocked<PlayerRepository>;

  const buildPlayer = (id: string, name: string, elo: number): Player =>
    new Player(id, name, elo, elo, 0, 0, 0, 0, 0, 0, []);

  const mockPlayers: Player[] = [
    buildPlayer('1', 'Santi', 1028),
    buildPlayer('2', 'Goro', 1023),
    buildPlayer('3', 'Naza', 988),
    buildPlayer('4', 'Seba P', 1006),
    buildPlayer('5', 'Teo', 980),
    buildPlayer('6', 'Nahue', 942),
    buildPlayer('7', 'Seba Q', 1012),
    buildPlayer('8', 'Axel', 930),
    buildPlayer('9', 'Nico', 978),
    buildPlayer('10', 'Luca', 1027),
  ];

  beforeEach(() => {
    mockRepo = {
      findAll: jest.fn().mockResolvedValue(mockPlayers),
      save: jest.fn(),
    };

    useCase = new GenerateBalancedTeamsUseCase(mockRepo);
  });

  it('should return balanced team options with correct structure', async () => {
    const dto: GenerateBalancedTeamsDto = {
      playerIds: mockPlayers.map(p => p.id),
    };

    const result = await useCase.execute(dto);

    expect(result).toBeDefined();
    expect(result.length).toBeLessThanOrEqual(5);
    expect(result[0]).toHaveProperty('teamA');
    expect(result[0]).toHaveProperty('teamB');
    expect(result[0]).toHaveProperty('eloA');
    expect(result[0]).toHaveProperty('eloB');
    expect(result[0]).toHaveProperty('difference');
    expect(mockRepo.findAll).toHaveBeenCalled();
  });
});
