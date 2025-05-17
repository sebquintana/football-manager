import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchPlayer } from '@domain/entities/match-player';
import { MatchPlayerPersistence } from './match-player.entity';

@Injectable()
export class TypeOrmMatchPlayerRepository {
  constructor(
    @InjectRepository(MatchPlayerPersistence)
    private readonly matchPlayerRepository: Repository<MatchPlayer>,
  ) {}

  async saveMatchPlayer(matchPlayer: MatchPlayer): Promise<MatchPlayer> {
    return this.matchPlayerRepository.save(this.toPersistence(matchPlayer));
  }

  toPersistence(matchPlayer: MatchPlayer): MatchPlayerPersistence {
    return {
      matchId: matchPlayer.matchId,
      playerId: matchPlayer.playerId,
      match: matchPlayer.match,
      player: matchPlayer.player,
      team: matchPlayer.team,
      eloBefore: matchPlayer.eloBefore,
      eloAfter: matchPlayer.eloAfter,
    };
  }
}
