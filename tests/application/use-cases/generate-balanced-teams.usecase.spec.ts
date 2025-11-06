import { GenerateBalancedTeamsUseCase } from '../../../src/application/use-cases/generate-balanced-teams.usecase';
import { PlayerRepository } from '../../../src/domain/ports/player.repository';
import { MatchRepository } from '../../../src/domain/ports/match.repository';
import { Player } from '../../../src/domain/entities/player';
import { GenerateBalancedTeamsDto } from '../../../src/application/dto/generate-balanced-teams.dto';

describe('GenerateBalancedTeamsUseCase', () => {
  let useCase: GenerateBalancedTeamsUseCase;
  let mockPlayerRepo: jest.Mocked<PlayerRepository>;
  let mockMatchRepo: jest.Mocked<MatchRepository>;

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
    mockPlayerRepo = {
      findAll: jest.fn().mockResolvedValue(mockPlayers),
      save: jest.fn(),
    };

    mockMatchRepo = {
      findAll: jest.fn().mockResolvedValue([]),
      save: jest.fn(),
    };

    useCase = new GenerateBalancedTeamsUseCase(mockPlayerRepo, mockMatchRepo);
  });

  it('should return balanced team options with correct structure', async () => {
    const dto: GenerateBalancedTeamsDto = {
      playerNames: mockPlayers.map((p) => p.name),
    };

    const result = await useCase.execute(dto);

    expect(result).toBeDefined();
    expect(result.length).toBeLessThanOrEqual(15);
    expect(result[0]).toHaveProperty('teamA');
    expect(result[0]).toHaveProperty('teamB');
    expect(result[0]).toHaveProperty('eloA');
    expect(result[0]).toHaveProperty('eloB');
    expect(result[0]).toHaveProperty('difference');
    expect(result[0]).toHaveProperty('teamAMetrics');
    expect(result[0]).toHaveProperty('teamBMetrics');
    expect(result[0]).toHaveProperty('balanceScore');
    expect(result[0]).toHaveProperty('synergyWarnings');
    expect(mockPlayerRepo.findAll).toHaveBeenCalled();
    expect(mockMatchRepo.findAll).toHaveBeenCalled();
  });
});
