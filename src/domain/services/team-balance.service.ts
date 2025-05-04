import { Player } from '@domain/entities/player.entity';
import { BalancedTeams } from '@domain/entities/balanced-teams.entity';
import { MinimumPlayersError, PlayerNotFoundError } from '@domain/errors/custom.errors';
import { PlayerRepository } from '@domain/ports/player.repository';

export class TeamBalanceService {
  constructor(readonly playersRepository: PlayerRepository) {}

  async generateBalancedTeams(playersNames: string[]): Promise<BalancedTeams> {
    if (playersNames.length < 10) {
      throw new MinimumPlayersError();
    }

    const players: Player[] = await Promise.all(
      playersNames.map(async (name) => {
        const player = await this.playersRepository.findByName(name);
        if (!player) {
          throw new PlayerNotFoundError(name);
        }
        return player;
      }),
    );

    const sortedPlayers = [...players].sort((a, b) => b.elo - a.elo);
    const teamA: Player[] = [];
    const teamB: Player[] = [];

    for (const player of sortedPlayers) {
      if (this.getTeamElo(teamA) <= this.getTeamElo(teamB)) {
        teamA.push(player);
      } else {
        teamB.push(player);
      }
    }

    const difference = Math.abs(this.getTeamElo(teamA) - this.getTeamElo(teamB));

    return new BalancedTeams(teamA, teamB, difference);
  }

  private getTeamElo(team: Player[]): number {
    return team.reduce((total, player) => total + player.elo, 0);
  }
}
