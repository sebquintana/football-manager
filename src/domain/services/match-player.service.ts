import { Inject, Injectable } from '@nestjs/common';
import { MatchPlayer } from '@domain/entities/match-player';
import { MatchPlayerRepository } from '@domain/ports/match-player.repository';

@Injectable()
export class MatchPlayerService {
  constructor(
    @Inject('MatchPlayerRepository')
    private readonly matchPlayerRepository: MatchPlayerRepository,
  ) {}

  async saveMatchPlayer(matchPlayer: MatchPlayer): Promise<MatchPlayer> {
    return this.matchPlayerRepository.saveMatchPlayer(matchPlayer);
  }

  async saveMatchPlayers(matchPlayers: MatchPlayer[]): Promise<MatchPlayer[]> {
    matchPlayers.forEach(async (matchPlayer) => {
      await this.matchPlayerRepository.saveMatchPlayer(matchPlayer);
    });
    return matchPlayers;
  }
}
