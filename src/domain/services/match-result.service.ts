import { Match } from '../entities/match';
import { Player } from '../entities/player';
import { EloChange } from '../entities/elo-change';

export class MatchResultService {
  static processMatch(match: Match): Player[] {
    const updatedPlayers: Player[] = [];
    const teamAWon = match.winner === 'A';
    const teamBWon = match.winner === 'B';
    const draw = match.winner === 'draw';

    for (const player of match.teamA.players) {
      const updated = MatchResultService.updatePlayer(
        player,
        teamAWon,
        teamBWon,
        draw,
        match.goalDifference,
        match.id, // <-- nuevo argumento
      );
      updatedPlayers.push(updated);
    }

    for (const player of match.teamB.players) {
      const updated = MatchResultService.updatePlayer(
        player,
        teamBWon,
        teamAWon,
        draw,
        match.goalDifference,
        match.id, // <-- nuevo argumento
      );
      updatedPlayers.push(updated);
    }

    return updatedPlayers;
  }

  private static updatePlayer(
    player: Player,
    won: boolean,
    lost: boolean,
    draw: boolean,
    goalDiff: number,
    matchId?: string, // <-- nuevo argumento
  ): Player {
    let newElo = player.elo;
    const POINTS_PER_GAME = 10;

    if (won) newElo += POINTS_PER_GAME + goalDiff;
    if (lost) newElo -= POINTS_PER_GAME + goalDiff;
    if (draw) newElo += POINTS_PER_GAME / 2;

    const winCount = player.winCount + (won ? 1 : 0);
    const lossCount = player.lossCount + (lost ? 1 : 0);
    const drawCount = player.drawCount + (draw ? 1 : 0);

    return new Player(
      player.id,
      player.name,
      newElo,
      player.initialElo,
      player.totalMatchesPlayed + 1,
      winCount,
      lossCount,
      drawCount,
      player.goalsFor + (won ? goalDiff : 0),
      player.goalsAgainst + (lost ? goalDiff : 0),
      [...player.history, new EloChange(player.elo, newElo, new Date(), matchId)],
    );
  }
}
