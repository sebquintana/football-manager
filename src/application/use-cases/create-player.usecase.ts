import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Player } from '@domain/entities/player';
import { PlayerRepository } from '@domain/ports/player.repository';
import { CreatePlayerDto } from '../dto/create-player.dto';

@Injectable()
export class CreatePlayerUseCase {
  constructor(
    @Inject('PlayerRepository')
    private readonly playerRepository: PlayerRepository,
  ) {}

  async execute(dto: CreatePlayerDto): Promise<Player> {
    const player = new Player(
      uuidv4(),
      dto.name,
      dto.initialElo,
      dto.initialElo,
      0, 0, 0, 0, 0, 0, []
    );

    return this.playerRepository.save(player);
  }
}
