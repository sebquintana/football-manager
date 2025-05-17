import { Inject, Injectable } from '@nestjs/common';
import { Match } from '@domain/entities/match';
import { MatchService } from './match.service';
import { MatchPlayerService } from './match-player.service';
import { PlayerService } from './player.service';
import { MatchPlayer } from '@domain/entities/match-player';

@Injectable()
export class MatchResultService {
  constructor(
    private readonly matchService: MatchService,
    private readonly matchPlayerService: MatchPlayerService,
    private readonly playerService: PlayerService,
  ) {}

  async saveMatchResult(matchData: {
    teamWinner: 'A' | 'B' | 'EMPATE';
    goalDifference: number;
    players: { id: string; team: 'A' | 'B'; elo: number }[];
  }): Promise<void> {
    const match: Match = await this.matchService.saveMatch(
      new Date().toISOString(),
      matchData.teamWinner,
      matchData.goalDifference,
    );

    // Prepare match player records and update player ELOs
    const matchPlayers: MatchPlayer[] = [];
    for (const player of matchData.players) {
      const isWinner = player.team === matchData.teamWinner;
      const eloChange = isWinner ? 10 + matchData.goalDifference : -(10 + matchData.goalDifference);

      // Update player ELO
      const updatedPlayer = await this.playerService.updateElo(player.id, player.elo + eloChange);

      // Create match player record
      matchPlayers.push({
        matchId: match.id,
        playerId: player.id,
        team: player.team,
        eloBefore: player.elo,
        eloAfter: updatedPlayer.elo,
      } as MatchPlayer);
    }

    this.matchPlayerService.saveMatchPlayers(matchPlayers);
  }
}
