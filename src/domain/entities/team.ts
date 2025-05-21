import { Player } from './player';

export class Team {
  constructor(
    public readonly id: string,
    public readonly players: Player[],
  ) {
    if (players.length !== 5) {
      throw new Error('A team must have exactly 5 players');
    }
  }

  get elo(): number {
    return this.players.reduce((sum, p) => sum + p.elo, 0);
  }

  hasPlayer(playerId: string): boolean {
    return this.players.some(p => p.id === playerId);
  }
}
