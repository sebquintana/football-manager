import { Player } from '@domain/entities/player';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { PlayerPersistence } from './player.entity';
import { PlayerRepository } from '@domain/ports/player.repository';

export class TypeOrmPlayerRepository implements PlayerRepository {
  constructor(
    @InjectRepository(PlayerPersistence)
    private readonly playerRepository: Repository<PlayerPersistence>,
  ) {}

  async findById(id: string): Promise<Player> {
    const player = await this.playerRepository.findOne({ where: { id } });
    if (!player) {
      throw new Error(`Player with ID ${id} not found`);
    }
    return new Player(player.id, player.name, player.elo, player.initialElo);
  }

  async findByName(name: string): Promise<Player> {
    const player = await this.playerRepository.findOne({ where: { name } });
    if (!player) {
      throw new Error(`Player with name ${name} not found`);
    }
    return new Player(player.id, player.name, player.elo, player.initialElo);
  }

  async save(player: Player): Promise<void> {
    const playerEntity = new PlayerPersistence();
    playerEntity.id = player.id;
    playerEntity.name = player.name;
    playerEntity.elo = player.elo;
    playerEntity.initialElo = player.initialElo;

    await this.playerRepository.save(playerEntity);
  }
}
