import { GetPlayersRankingUseCase } from '@application/use-cases/get-players-ranking.usecase';
import { PlayerRepository } from '@domain/ports/player.repository';
import { MatchRepository } from '@domain/ports/match.repository';
import { Player } from '@domain/entities/player';

const buildPlayer = (id: string, name: string, elo: number, matchesPlayed: number) =>
  new Player(id, name, elo, elo, matchesPlayed, 0, 0, 0, 0, 0, []);

const buildMatches = (count: number) =>
  Array.from({ length: count }, (_, i) => ({ id: String(i) })) as any[];

describe('GetPlayersRankingUseCase', () => {
  let useCase: GetPlayersRankingUseCase;
  let mockPlayerRepo: jest.Mocked<PlayerRepository>;
  let mockMatchRepo: jest.Mocked<MatchRepository>;

  beforeEach(() => {
    mockPlayerRepo = { findAll: jest.fn(), save: jest.fn() };
    mockMatchRepo = { findAll: jest.fn(), save: jest.fn() } as any;
    useCase = new GetPlayersRankingUseCase(mockPlayerRepo, mockMatchRepo);
  });

  it('should return empty array when there are no players', async () => {
    mockPlayerRepo.findAll.mockResolvedValue([]);
    mockMatchRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();
    expect(result).toEqual([]);
  });

  it('should return empty array when no matches have been played', async () => {
    mockPlayerRepo.findAll.mockResolvedValue([buildPlayer('1', 'Axel', 1000, 0)]);
    mockMatchRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();
    expect(result).toEqual([]);
  });

  it('should filter out players with attendance <= 30%', async () => {
    // 10 total matches: need > 3 matches (> 30%) to qualify
    mockMatchRepo.findAll.mockResolvedValue(buildMatches(10));
    mockPlayerRepo.findAll.mockResolvedValue([
      buildPlayer('1', 'Axel', 1100, 3), // 30% — NOT > 0.3, filtered out
      buildPlayer('2', 'Santi', 1050, 4), // 40% — included
      buildPlayer('3', 'Luca', 1000, 1), // 10% — filtered out
    ]);

    const result = await useCase.execute();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Santi');
  });

  it('should sort players by ELO descending and assign positions', async () => {
    mockMatchRepo.findAll.mockResolvedValue(buildMatches(5));
    mockPlayerRepo.findAll.mockResolvedValue([
      buildPlayer('1', 'Axel', 900, 4), // 80% — included
      buildPlayer('2', 'Santi', 1100, 4), // 80% — included
      buildPlayer('3', 'Luca', 1000, 4), // 80% — included
    ]);

    const result = await useCase.execute();
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ position: 1, name: 'Santi', elo: 1100 });
    expect(result[1]).toEqual({ position: 2, name: 'Luca', elo: 1000 });
    expect(result[2]).toEqual({ position: 3, name: 'Axel', elo: 900 });
  });
});
