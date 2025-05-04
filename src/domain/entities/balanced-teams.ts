import { Player } from './player';

export class BalancedTeams {
  constructor(
    public teamA: string[],
    public teamB: string[],
    public difference: number,
  ) {}
}
