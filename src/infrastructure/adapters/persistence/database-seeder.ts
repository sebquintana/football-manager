import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerPersistence } from './player.entity';

@Injectable()
export class DatabaseSeeder implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(PlayerPersistence)
    private readonly playerRepository: Repository<PlayerPersistence>,
  ) {}

  async onApplicationBootstrap() {
    const initialPlayers = [
      { name: 'Nico', elo: 976, initialElo: 976 },
      { name: 'Nahue', elo: 944, initialElo: 944 },
      { name: 'Santi', elo: 1026, initialElo: 1026 },
      { name: 'Luca', elo: 1016, initialElo: 1016 },
      { name: 'Seba Q', elo: 1014, initialElo: 1014 },
      { name: 'Mati P', elo: 1004, initialElo: 1004 },
      { name: 'Colu', elo: 1000, initialElo: 1000 },
      { name: 'Kevin', elo: 980, initialElo: 980 },
      { name: 'Naza', elo: 964, initialElo: 964 },
      { name: 'Axel', elo: 954, initialElo: 954 },
    ];

    for (const player of initialPlayers) {
      const exists = await this.playerRepository.findOne({ where: { name: player.name } });
      if (!exists) {
        await this.playerRepository.save(player);
      }
    }
  }
}
