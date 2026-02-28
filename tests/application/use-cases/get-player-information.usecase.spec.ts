import { GetPlayerInformationUseCase } from '@application/use-cases/get-player-information.usecase';
import { PlayerRepository } from '@domain/ports/player.repository';
import { MatchRepository } from '@domain/ports/match.repository';
import { Player } from '@domain/entities/player';
import { Match } from '@domain/entities/match';
import { Team } from '@domain/entities/team';
import { NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

const mkPlayer = (
  id: string,
  name: string,
  played: number,
  wins: number,
  losses: number,
  draws: number,
  elo: number = 1000,
) => new Player(id, name, elo, 1000, played, wins, losses, draws, wins * 2, losses * 2, []);

// Team requires exactly 5 players
const mkMatch = (
  id: string,
  date: Date,
  teamA: Player[],
  teamB: Player[],
  winner: 'A' | 'B' | 'draw',
  diff: number,
) => new Match(id, date, new Team(uuidv4(), teamA), new Team(uuidv4(), teamB), winner, diff);

describe('GetPlayerInformationUseCase', () => {
  let useCase: GetPlayerInformationUseCase;
  let mockPlayerRepo: jest.Mocked<PlayerRepository>;
  let mockMatchRepo: jest.Mocked<MatchRepository>;

  beforeEach(() => {
    mockPlayerRepo = { findAll: jest.fn(), save: jest.fn() };
    mockMatchRepo = { findAll: jest.fn(), save: jest.fn() } as any;
    useCase = new GetPlayerInformationUseCase(mockPlayerRepo, mockMatchRepo);
  });

  it('should throw NotFoundException when player is not found', async () => {
    mockPlayerRepo.findAll.mockResolvedValue([mkPlayer('1', 'Axel', 3, 2, 1, 0)]);
    mockMatchRepo.findAll.mockResolvedValue([]);

    await expect(useCase.execute('NonExistent')).rejects.toThrow(NotFoundException);
  });

  it('should be case-insensitive when looking up player', async () => {
    mockPlayerRepo.findAll.mockResolvedValue([mkPlayer('1', 'Axel', 3, 2, 1, 0)]);
    mockMatchRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute('axel');
    expect(result.name).toBe('Axel');
  });

  it('should return basic player fields correctly', async () => {
    const player = mkPlayer('1', 'Axel', 5, 3, 1, 1, 1050);
    mockPlayerRepo.findAll.mockResolvedValue([player]);
    mockMatchRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute('Axel');

    expect(result.id).toBe('1');
    expect(result.name).toBe('Axel');
    expect(result.elo).toBe(1050);
    expect(result.totalMatchesPlayed).toBe(5);
    expect(result.winCount).toBe(3);
    expect(result.lossCount).toBe(1);
    expect(result.drawCount).toBe(1);
  });

  it('should calculate winRate correctly counting draws as half point', async () => {
    // equivalentWins = 3 + 1*0.5 = 3.5 / 5 = 70%
    const player = mkPlayer('1', 'Axel', 5, 3, 1, 1);
    mockPlayerRepo.findAll.mockResolvedValue([player]);
    mockMatchRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute('Axel');
    expect(result.winRate).toBe(70);
  });

  it('should calculate attendanceRate correctly', async () => {
    const player = mkPlayer('1', 'Axel', 4, 2, 2, 0);
    // 8 total matches, player played 4 → 50%; use plain objects to avoid Team validation
    const dummyMatches = Array.from({ length: 8 }, (_, i) => ({
      id: `m${i}`,
      teamA: { players: [] },
      teamB: { players: [] },
    })) as any[];
    mockPlayerRepo.findAll.mockResolvedValue([player]);
    mockMatchRepo.findAll.mockResolvedValue(dummyMatches);

    const result = await useCase.execute('Axel');
    expect(result.attendanceRate).toBe(50);
  });

  it('should calculate streaks correctly from match history', async () => {
    const axel = mkPlayer('axel', 'Axel', 4, 3, 1, 0);
    // Fill out to 5 per team
    const teamA = [axel, ...['t1', 't2', 't3', 't4'].map((id) => mkPlayer(id, id, 4, 3, 1, 0))];
    const teamB = ['o1', 'o2', 'o3', 'o4', 'o5'].map((id) => mkPlayer(id, id, 4, 1, 3, 0));

    // Results for Axel (teamA): W, W, L, W
    const matches = [
      mkMatch('m1', new Date('2024-01-01'), teamA, teamB, 'A', 2),
      mkMatch('m2', new Date('2024-01-08'), teamA, teamB, 'A', 1),
      mkMatch('m3', new Date('2024-01-15'), teamA, teamB, 'B', 1),
      mkMatch('m4', new Date('2024-01-22'), teamA, teamB, 'A', 2),
    ];

    mockPlayerRepo.findAll.mockResolvedValue([axel, ...teamA.slice(1), ...teamB]);
    mockMatchRepo.findAll.mockResolvedValue(matches);

    const result = await useCase.execute('Axel');

    // W,W,L,W → current streak: 1 win (last match), maxWin: 2, maxLoss: 1
    expect(result.streaks.currentType).toBe('win');
    expect(result.streaks.currentCount).toBe(1);
    expect(result.streaks.maxWinStreak).toBe(2);
    expect(result.streaks.maxLossStreak).toBe(1);
  });

  it('should calculate synergies correctly', async () => {
    const axel = mkPlayer('axel', 'Axel', 4, 2, 2, 0);
    const santi = mkPlayer('santi', 'Santi', 4, 2, 2, 0);
    const luca = mkPlayer('luca', 'Luca', 4, 2, 2, 0);
    const extra1 = mkPlayer('extra1', 'Extra1', 4, 2, 2, 0);
    const extra2 = mkPlayer('extra2', 'Extra2', 4, 2, 2, 0);
    const teamA = [axel, santi, luca, extra1, extra2];
    const teamB = ['o1', 'o2', 'o3', 'o4', 'o5'].map((id) => mkPlayer(id, id, 4, 2, 2, 0));

    // Axel always in teamA: 2W, 2L across 4 matches
    const matches = [
      mkMatch('m1', new Date('2024-01-01'), teamA, teamB, 'A', 1),
      mkMatch('m2', new Date('2024-01-08'), teamA, teamB, 'A', 1),
      mkMatch('m3', new Date('2024-01-15'), teamA, teamB, 'B', 1),
      mkMatch('m4', new Date('2024-01-22'), teamA, teamB, 'B', 1),
    ];

    mockPlayerRepo.findAll.mockResolvedValue([...teamA, ...teamB]);
    mockMatchRepo.findAll.mockResolvedValue(matches);

    const result = await useCase.execute('Axel');

    // Axel has 4 teammates: santi, luca, extra1, extra2 (each 4 matches, 2W/2L, 50% WR)
    expect(result.synergies.mates).toHaveLength(4);

    const santiSynergy = result.synergies.mates.find((m) => m.mate === 'Santi');
    expect(santiSynergy?.matches).toBe(4);
    expect(santiSynergy?.victories).toBe(2);
    expect(santiSynergy?.losses).toBe(2);
    expect(santiSynergy?.draws).toBe(0);
    expect(santiSynergy?.winRate).toBe(50);
  });

  it('should return zero streaks and empty synergies when player has no matches', async () => {
    const player = mkPlayer('1', 'Axel', 0, 0, 0, 0);
    mockPlayerRepo.findAll.mockResolvedValue([player]);
    mockMatchRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute('Axel');

    expect(result.streaks.currentType).toBeNull();
    expect(result.streaks.currentCount).toBe(0);
    expect(result.streaks.maxWinStreak).toBe(0);
    expect(result.synergies.mates).toHaveLength(0);
    expect(result.synergies.bestMate).toBeNull();
    expect(result.attendanceRate).toBe(0);
    expect(result.winRate).toBe(0);
  });
});
