import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PlayerRepository } from '@domain/ports/player.repository';

@Injectable()
export class UpdatePlayerEloUseCase {
  constructor(
    @Inject('PlayerRepository')
    private readonly playerRepository: PlayerRepository,
  ) {}

  async execute(playerId: string, newElo: number): Promise<void> {
    const allPlayers = await this.playerRepository.findAll();
    const player = allPlayers.find((p) => p.id === playerId);
    if (!player) throw new NotFoundException('Player not found');

    const updated = player.updateElo(newElo);
    await this.playerRepository.save(updated);
  }
}
