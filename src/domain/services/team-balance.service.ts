import { Player } from '@domain/entities/player';
import { MinimumPlayersError, PlayerNotFoundError } from '@domain/errors/custom.errors';
import { PlayerRepository } from '@domain/ports/player.repository';
import { Inject } from '@nestjs/common';

export class TeamBalanceService {
  constructor(@Inject('PlayerRepository') readonly playersRepository: PlayerRepository) {}

  async generateBalancedTeams(
    playersNames: string[],
  ): Promise<{ teamA: string[]; teamB: string[]; difference: number }> {
    if (!Array.isArray(playersNames)) {
      throw new TypeError('playersNames must be an array of strings');
    }

    if (!playersNames || playersNames.length < 10) {
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

    return {
      teamA: teamA.map((player) => player.name),
      teamB: teamB.map((player) => player.name),
      difference,
    };
  }

  private getTeamElo(team: Player[]): number {
    return team.reduce((total, player) => total + player.elo, 0);
  }
}
