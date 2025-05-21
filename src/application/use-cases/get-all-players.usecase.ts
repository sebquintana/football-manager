import { Injectable, Inject } from '@nestjs/common';
import { Player } from '@domain/entities/player';
import { PlayerRepository } from '@domain/ports/player.repository';

@Injectable()
export class GetAllPlayersUseCase {
  constructor(
    @Inject('PlayerRepository')
    private readonly playerRepository: PlayerRepository,
  ) {}

  async execute(): Promise<Player[]> {
    return this.playerRepository.findAll();
  }
}
