import { Match } from './match';
import { Player } from './player';

export class MatchPlayer {
  constructor(
    public matchId: string,
    public playerId: string,
    public match: Match,
    public player: Player,
    public team: string,
    public eloBefore: number,
    public eloAfter: number,
  ) {}

  static create(
    matchId: string,
    playerId: string,
    match: Match,
    player: Player,
    team: string,
    eloBefore: number,
    eloAfter: number,
  ): MatchPlayer {
    return new MatchPlayer(matchId, playerId, match, player, team, eloBefore, eloAfter);
  }
}
