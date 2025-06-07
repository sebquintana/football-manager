import { GetMatchesSummaryUseCase } from '../../../src/application/use-cases/get-matches-summary.usecase';
import { MatchRepository } from '../../../src/domain/ports/match.repository';
import { Match } from '../../../src/domain/entities/match';
import { Team } from '../../../src/domain/entities/team';
import { Player } from '../../../src/domain/entities/player';

describe('GetMatchesSummaryUseCase', () => {
  let matchRepository: MatchRepository;
  let useCase: GetMatchesSummaryUseCase;

  beforeEach(() => {
    matchRepository = {
      findAll: jest.fn(),
      save: jest.fn(),
    } as any;
    useCase = new GetMatchesSummaryUseCase(matchRepository);
  });

  it('should return a summary of matches', async () => {
    const matchData = [
      new Match(
        '1',
        new Date('2024-01-01'),
        new Team('A', [
          new Player('1', 'Axel', 1000, 1000, 1, 1, 0, 0, 2, 0, []),
          new Player('7', 'Test1', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
          new Player('8', 'Test2', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
          new Player('9', 'Test3', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
          new Player('10', 'Test4', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
        ]),
        new Team('B', [
          new Player('2', 'Nico', 1000, 1000, 1, 0, 1, 0, 0, 2, []),
          new Player('11', 'Test5', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
          new Player('12', 'Test6', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
          new Player('13', 'Test7', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
          new Player('14', 'Test8', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
        ]),
        'A',
        2,
      ),
      new Match(
        '2',
        new Date('2024-01-02'),
        new Team('C', [
          new Player('3', 'Seba', 1000, 1000, 1, 0, 1, 0, 1, 2, []),
          new Player('15', 'Test9', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
          new Player('16', 'Test10', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
          new Player('17', 'Test11', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
          new Player('18', 'Test12', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
        ]),
        new Team('D', [
          new Player('4', 'Luca', 1000, 1000, 1, 1, 0, 0, 2, 1, []),
          new Player('19', 'Test13', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
          new Player('20', 'Test14', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
          new Player('21', 'Test15', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
          new Player('22', 'Test16', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
        ]),
        'B',
        1,
      ),
      new Match(
        '3',
        new Date('2024-01-03'),
        new Team('E', [
          new Player('5', 'Rodri', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
          new Player('23', 'Test17', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
          new Player('24', 'Test18', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
          new Player('25', 'Test19', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
          new Player('26', 'Test20', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
        ]),
        new Team('F', [
          new Player('6', 'Juanchi', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
          new Player('27', 'Test21', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
          new Player('28', 'Test22', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
          new Player('29', 'Test23', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
          new Player('30', 'Test24', 1000, 1000, 1, 0, 0, 1, 1, 1, []),
        ]),
        'draw',
        0,
      ),
    ];
    (matchRepository.findAll as jest.Mock).mockResolvedValue(matchData);

    const result = await useCase.execute();
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      id: '1',
      date: new Date('2024-01-01'),
      winner: 'A',
      goalDifference: 2,
      teamAPlayers: ['Axel', 'Test1', 'Test2', 'Test3', 'Test4'],
      teamBPlayers: ['Nico', 'Test5', 'Test6', 'Test7', 'Test8'],
    });
    expect(result[1]).toEqual({
      id: '2',
      date: new Date('2024-01-02'),
      winner: 'B',
      goalDifference: 1,
      teamAPlayers: ['Seba', 'Test9', 'Test10', 'Test11', 'Test12'],
      teamBPlayers: ['Luca', 'Test13', 'Test14', 'Test15', 'Test16'],
    });
    expect(result[2]).toEqual({
      id: '3',
      date: new Date('2024-01-03'),
      winner: 'draw',
      goalDifference: 0,
      teamAPlayers: ['Rodri', 'Test17', 'Test18', 'Test19', 'Test20'],
      teamBPlayers: ['Juanchi', 'Test21', 'Test22', 'Test23', 'Test24'],
    });
  });

  it('should return an empty array if there are no matches', async () => {
    (matchRepository.findAll as jest.Mock).mockResolvedValue([]);
    const result = await useCase.execute();
    expect(result).toEqual([]);
  });
});
