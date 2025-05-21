import { MatchResultService } from '@domain/services/match-result.service';
import { Match } from '@domain/entities/match';
import { Player } from '@domain/entities/player';
import { Team } from '@domain/entities/team';
import { v4 as uuidv4 } from 'uuid';

const buildPlayer = (id: string, name: string, elo: number) =>
  new Player(id, name, elo, elo, 0, 0, 0, 0, 0, 0, []);

describe('MatchResultService', () => {
  const teamAPlayers = [
    buildPlayer('1', 'Santi', 1000),
    buildPlayer('2', 'Axel', 1000),
    buildPlayer('3', 'Luca', 1000),
    buildPlayer('4', 'Teo', 1000),
    buildPlayer('5', 'Goro', 1000),
  ];

  const teamBPlayers = [
    buildPlayer('6', 'Nahue', 1000),
    buildPlayer('7', 'Seba Q', 1000),
    buildPlayer('8', 'Naza', 1000),
    buildPlayer('9', 'Nico', 1000),
    buildPlayer('10', 'Seba P', 1000),
  ];

  const buildMatch = (
    winner: 'A' | 'B' | 'draw',
    goalDifference: number,
  ): Match => {
    return new Match(
      uuidv4(),
      new Date(),
      new Team(uuidv4(), [...teamAPlayers]),
      new Team(uuidv4(), [...teamBPlayers]),
      winner,
      goalDifference,
    );
  };

  it('should correctly apply win/loss and elo updates', () => {
    const match = buildMatch('A', 2);
    const result = MatchResultService.processMatch(match);

    const axel = result.find(p => p.name === 'Axel')!;
    const nahue = result.find(p => p.name === 'Nahue')!;

    expect(axel.winCount).toBe(1);
    expect(nahue.lossCount).toBe(1);

    expect(axel.elo).toBe(1000 + 12); // +12
    expect(nahue.elo).toBe(1000 - 12); // -12

    expect(axel.history).toHaveLength(1);
    expect(axel.history[0].oldElo).toBe(1000);
    expect(axel.history[0].newElo).toBe(1012);
  });

  it('should correctly apply draw and keep elo unchanged', () => {
    const match = buildMatch('draw', 0);
    const result = MatchResultService.processMatch(match);

    const axel = result.find(p => p.name === 'Axel')!;
    const nahue = result.find(p => p.name === 'Nahue')!;

    expect(axel.drawCount).toBe(1);
    expect(nahue.drawCount).toBe(1);
    expect(axel.elo).toBe(1000);
    expect(nahue.elo).toBe(1000);
  });
});
