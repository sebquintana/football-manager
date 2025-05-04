import { Player } from '@domain/entities/player.entity';

export class BalancedTeams {
  constructor(
    public teamA: Player[],
    public teamB: Player[],
    public difference: number
  ) {}
}