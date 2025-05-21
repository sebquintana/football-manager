import { CreateMatchUseCase } from '@application/use-cases/create-match.usecase';
import { PlayerRepository } from '@domain/ports/player.repository';
import { MatchRepository } from '@domain/ports/match.repository';
import { CreateMatchDto } from '@application/dto/create-match.dto';
import { Player } from '@domain/entities/player';

describe('CreateMatchUseCase', () => {
  let useCase: CreateMatchUseCase;
  let mockPlayerRepo: jest.Mocked<PlayerRepository>;
  let mockMatchRepo: jest.Mocked<MatchRepository>;

  const mockPlayers = [
    new Player('1', 'Santi', 1028, 1028, 10, 6, 2, 2, 20, 10, []),
    new Player('2', 'Goro', 1023, 1023, 10, 5, 3, 2, 18, 11, []),
    new Player('3', 'Axel', 930, 930, 10, 3, 6, 1, 9, 22, []),
    new Player('4', 'Luca', 1027, 1027, 10, 5, 3, 2, 16, 12, []),
    new Player('5', 'Nico', 978, 978, 10, 5, 3, 2, 14, 13, []),
    new Player('6', 'Nahue', 942, 942, 10, 4, 4, 2, 13, 15, []),
    new Player('7', 'Seba Q', 1012, 1012, 10, 6, 2, 2, 19, 10, []),
    new Player('8', 'Teo', 980, 980, 10, 3, 5, 2, 12, 17, []),
    new Player('9', 'Seba P', 1006, 1006, 10, 5, 4, 1, 15, 14, []),
    new Player('10', 'Naza', 988, 988, 10, 4, 4, 2, 13, 16, []),
  ];

  beforeEach(() => {
    mockPlayerRepo = {
      findAll: jest.fn().mockResolvedValue(mockPlayers),
      save: jest.fn(),
    };

    mockMatchRepo = {
      save: jest.fn().mockImplementation(async (match) => match),
    };

    useCase = new CreateMatchUseCase(mockPlayerRepo, mockMatchRepo);
  });

  it('should create and save a match with valid input', async () => {
    const dto: CreateMatchDto = {
      teamAIds: ['1', '2', '3', '4', '5'],
      teamBIds: ['6', '7', '8', '9', '10'],
      winner: 'A',
      goalDifference: 2,
      date: new Date().toISOString(),
    };

    const result = await useCase.execute(dto);

    expect(result.teamA.players).toHaveLength(5);
    expect(result.teamB.players).toHaveLength(5);
    expect(result.winner).toBe('A');
    expect(result.goalDifference).toBe(2);
    expect(mockPlayerRepo.findAll).toHaveBeenCalled();
    expect(mockMatchRepo.save).toHaveBeenCalledWith(expect.anything());
  });
});
