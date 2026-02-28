import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerRepository } from '@domain/ports/player.repository';
import { Player } from '@domain/entities/player';
import { EloChange } from '@domain/entities/elo-change';
import { PlayerEntity } from './entities/player.entity';

@Injectable()
export class TypeOrmPlayerRepository implements PlayerRepository {
  constructor(
    @InjectRepository(PlayerEntity)
    private readonly repo: Repository<PlayerEntity>,
  ) {}

  async save(player: Player): Promise<Player> {
    await this.repo.save({
      id: player.id,
      name: player.name,
      elo: player.elo,
      initialElo: player.initialElo,
      totalMatchesPlayed: player.totalMatchesPlayed,
      winCount: player.winCount,
      lossCount: player.lossCount,
      drawCount: player.drawCount,
      goalsFor: player.goalsFor,
      goalsAgainst: player.goalsAgainst,
      history: player.history.map((h) => ({
        oldElo: h.oldElo,
        newElo: h.newElo,
        changedAt: h.changedAt.toISOString(),
        matchId: h.matchId,
      })),
    });
    return player;
  }

  async findAll(): Promise<Player[]> {
    const entities = await this.repo.find();
    return entities.map(
      (e) =>
        new Player(
          e.id,
          e.name,
          e.elo,
          e.initialElo,
          e.totalMatchesPlayed,
          e.winCount,
          e.lossCount,
          e.drawCount,
          e.goalsFor,
          e.goalsAgainst,
          (e.history ?? []).map(
            (h) => new EloChange(h.oldElo, h.newElo, new Date(h.changedAt), h.matchId),
          ),
        ),
    );
  }
}
