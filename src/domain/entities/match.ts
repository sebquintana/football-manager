import { Team } from './team';

export class Match {
  constructor(
    public readonly id: string,
    public readonly date: Date,
    public readonly teamA: Team,
    public readonly teamB: Team,
    public readonly winner: 'A' | 'B' | 'draw',
    public readonly goalDifference: number,
  ) {}
}
