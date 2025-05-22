import { Inject, Injectable } from '@nestjs/common';
import { PlayerRepository } from '@domain/ports/player.repository';
import { PlayerEloDTO } from '@application/dto/player-ranking.response.dto';

@Injectable()
export class GetPlayersRankingUseCase {
  constructor(
    @Inject('PlayerRepository')
    private readonly playerRepository: PlayerRepository,
  ) {}

  async execute(): Promise<PlayerEloDTO[]> {
    const players = await this.playerRepository.findAll();
    return players
      .sort((a, b) => b.elo - a.elo)
      .map((p, index) => ({
        position: index + 1,
        name: p.name,
        elo: p.elo,
      }));
  }
}
