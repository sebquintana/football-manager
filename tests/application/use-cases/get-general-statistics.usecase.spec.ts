import { GetGeneralStatisticsUseCase } from '@application/use-cases/get-general-statistics.usecase';
import { PlayerRepository } from '@domain/ports/player.repository';
import { MatchRepository } from '@domain/ports/match.repository';
import { Player } from '@domain/entities/player';
import { Match } from '@domain/entities/match';
import { Team } from '@domain/entities/team';
import { v4 as uuidv4 } from 'uuid';

const mkPlayer = (
  id: string,
  name: string,
  elo: number,
  initialElo: number,
  played: number,
  wins: number,
  losses: number,
  draws: number = 0,
) => new Player(id, name, elo, initialElo, played, wins, losses, draws, wins * 2, losses * 2, []);

const mkMatch = (
  id: string,
  date: Date,
  teamA: Player[],
  teamB: Player[],
  winner: 'A' | 'B' | 'draw',
  diff: number,
) => new Match(id, date, new Team(uuidv4(), teamA), new Team(uuidv4(), teamB), winner, diff);

// 10 players (5 per team), each played 4 matches
// averageElo = (1050+920+1010+1000+1005+1030+970+1040+995+980)/10 = 10000/10 = 1000
const teamA_players = [
  mkPlayer('p1', 'Axel', 1050, 1000, 4, 3, 1), // gain +50 (biggest gainer)
  mkPlayer('p2', 'Santi', 920, 1000, 4, 1, 3), // gain -80 (biggest loser)
  mkPlayer('p3', 'Luca', 1010, 1000, 4, 2, 2), // gain +10
  mkPlayer('p4', 'Teo', 1000, 1000, 4, 2, 2), // gain   0
  mkPlayer('p5', 'Felipe', 1005, 1000, 4, 2, 2), // gain  +5
];

const teamB_players = [
  mkPlayer('p6', 'Naza', 1030, 1000, 4, 2, 2), // gain +30
  mkPlayer('p7', 'Nahue', 970, 1000, 4, 2, 2), // gain -30
  mkPlayer('p8', 'Goro', 1040, 1000, 4, 3, 1), // gain +40
  mkPlayer('p9', 'Nico', 995, 1000, 4, 2, 2), // gain  -5
  mkPlayer('p10', 'Martin', 980, 1000, 4, 2, 2), // gain -20
];

const allPlayers = [...teamA_players, ...teamB_players];

// 4 matches: diffs = 2, 1, 0 (draw), 3
const testMatches = [
  mkMatch('m1', new Date('2024-01-01'), teamA_players, teamB_players, 'A', 2),
  mkMatch('m2', new Date('2024-01-08'), teamA_players, teamB_players, 'B', 1),
  mkMatch('m3', new Date('2024-01-15'), teamA_players, teamB_players, 'draw', 0),
  mkMatch('m4', new Date('2024-01-22'), teamB_players, teamA_players, 'A', 3),
];

describe('GetGeneralStatisticsUseCase', () => {
  let useCase: GetGeneralStatisticsUseCase;
  let mockPlayerRepo: jest.Mocked<PlayerRepository>;
  let mockMatchRepo: jest.Mocked<MatchRepository>;

  beforeEach(() => {
    mockPlayerRepo = { findAll: jest.fn(), save: jest.fn() };
    mockMatchRepo = { findAll: jest.fn(), save: jest.fn() } as any;
    useCase = new GetGeneralStatisticsUseCase(mockPlayerRepo, mockMatchRepo);
  });

  it('should return default empty stats when no data exists', async () => {
    mockPlayerRepo.findAll.mockResolvedValue([]);
    mockMatchRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result.totalPlayers).toBe(0);
    expect(result.totalMatches).toBe(0);
    expect(result.attendance.activePlayers).toBe(0);
    expect(result.attendance.highestAttendance.players).toEqual(['N/A']);
    expect(result.elo.distribution).toEqual([]);
    expect(result.elo.averageElo).toBe(0);
    expect(result.goals.averageGoalDifference).toBe(0);
    expect(result.results.totalMatches).toBe(0);
    expect(result.generatedAt).toBeDefined();
  });

  it('should return correct totalPlayers and totalMatches', async () => {
    mockPlayerRepo.findAll.mockResolvedValue(allPlayers);
    mockMatchRepo.findAll.mockResolvedValue(testMatches);

    const result = await useCase.execute();

    expect(result.totalPlayers).toBe(10);
    expect(result.totalMatches).toBe(4);
  });

  it('should calculate attendance stats correctly', async () => {
    mockPlayerRepo.findAll.mockResolvedValue(allPlayers);
    mockMatchRepo.findAll.mockResolvedValue(testMatches);

    const result = await useCase.execute();

    // All 10 players played 4/4 matches = 100%
    expect(result.attendance.highestAttendance.rate).toBe(100);
    expect(result.attendance.lowestAttendance.rate).toBe(100);
    expect(result.attendance.averageAttendance).toBe(100);
    expect(result.attendance.activePlayers).toBe(10); // all have rate > 50%
    expect(result.attendance.totalMatches).toBe(4);
  });

  it('should calculate result stats correctly', async () => {
    mockPlayerRepo.findAll.mockResolvedValue(allPlayers);
    mockMatchRepo.findAll.mockResolvedValue(testMatches);

    const result = await useCase.execute();

    expect(result.results.totalMatches).toBe(4);
    expect(result.results.draws).toBe(1); // m3
    expect(result.results.decisiveWins).toBe(2); // m1 (diff=2,A), m4 (diff=3,A)
    expect(result.results.narrowWins).toBe(1); // m2 (diff=1,B)
    expect(result.results.drawPercentage).toBe(25);
  });

  it('should calculate ELO stats correctly', async () => {
    mockPlayerRepo.findAll.mockResolvedValue(allPlayers);
    mockMatchRepo.findAll.mockResolvedValue(testMatches);

    const result = await useCase.execute();

    // Biggest gainer: Axel +50
    expect(result.elo.biggestGainer.gain).toBe(50);
    expect(result.elo.biggestGainer.players).toContain('Axel');

    // Biggest loser: Santi -80
    expect(result.elo.biggestLoser.loss).toBe(80);
    expect(result.elo.biggestLoser.players).toContain('Santi');

    // averageElo = 10000/10 = 1000
    expect(result.elo.averageElo).toBe(1000);
    expect(result.elo.eloRange.min).toBe(920);
    expect(result.elo.eloRange.max).toBe(1050);
  });

  it('should calculate goal stats correctly', async () => {
    mockPlayerRepo.findAll.mockResolvedValue(allPlayers);
    mockMatchRepo.findAll.mockResolvedValue(testMatches);

    const result = await useCase.execute();

    // Diffs: 2, 1, 0, 3 → avg = 1.5
    expect(result.goals.averageGoalDifference).toBe(1.5);
    expect(result.goals.maxGoalDifference).toBe(3);
    // closestMatches (diff <= 1): m2 (1), m3 (0) → 2
    expect(result.goals.closestMatches).toBe(2);
    // blowouts (diff >= 5): none
    expect(result.goals.blowouts).toBe(0);
    // biggest win: m4 (diff=3)
    expect(result.goals.biggestWin.difference).toBe(3);
  });
});
