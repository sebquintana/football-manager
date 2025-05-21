import { EloChange } from './elo-change';

export class Player {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly elo: number,
    public readonly initialElo: number,
    public readonly totalMatchesPlayed: number,
    public readonly winCount: number,
    public readonly lossCount: number,
    public readonly drawCount: number,
    public readonly goalsFor: number,
    public readonly goalsAgainst: number,
    public readonly history: EloChange[] = [],
  ) {}

  get goalDifference(): number {
    return this.goalsFor - this.goalsAgainst;
  }

  get winRate(): number {
    if (this.totalMatchesPlayed === 0) return 0;
    return this.winCount / this.totalMatchesPlayed;
  }

  updateElo(newElo: number): Player {
    const newHistory = [...this.history, new EloChange(this.elo, newElo)];
    return new Player(
      this.id,
      this.name,
      newElo,
      this.initialElo,
      this.totalMatchesPlayed,
      this.winCount,
      this.lossCount,
      this.drawCount,
      this.goalsFor,
      this.goalsAgainst,
      newHistory,
    );
  }
}
