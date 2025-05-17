import { Player } from '@domain/entities/player';
import { PlayerRepository } from '@domain/ports/player.repository';
import { Inject } from '@nestjs/common';

export class PlayerService {
  constructor(
    @Inject('PlayerRepository')
    private readonly playerRepository: PlayerRepository,
  ) {}

  async updateElo(playerId: string, newElo: number): Promise<Player> {
    const player = Player.fromPersistence(await this.playerRepository.findById(playerId));
    if (!player) {
      throw new Error('Player not found');
    }
    const updatedPlayer = player.updateElo(newElo);
    await this.playerRepository.save(updatedPlayer);
    return updatedPlayer;
  }
}
