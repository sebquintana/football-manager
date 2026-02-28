import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MatchRepository } from '@domain/ports/match.repository';
import { Match } from '@domain/entities/match';
import { Team } from '@domain/entities/team';
import { Player } from '@domain/entities/player';
import { MatchEntity } from './entities/match.entity';
import { MatchPlayerEntity } from './entities/match-player.entity';
import { PlayerEntity } from './entities/player.entity';

@Injectable()
export class TypeOrmMatchRepository implements MatchRepository {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,
    @InjectRepository(PlayerEntity)
    private readonly playerRepo: Repository<PlayerEntity>,
  ) {}

  async save(match: Match): Promise<Match> {
    const allSlots = [
      ...match.teamA.players.map((p) => ({ player: p, team: 'A' })),
      ...match.teamB.players.map((p) => ({ player: p, team: 'B' })),
    ];

    const playerIds = allSlots.map(({ player }) => player.id);
    const savedPlayers = await this.playerRepo.findBy({ id: In(playerIds) });
    const eloAfterMap = new Map(savedPlayers.map((pe) => [pe.id, pe.elo]));

    const matchPlayers: Partial<MatchPlayerEntity>[] = allSlots.map(({ player, team }) => ({
      matchId: match.id,
      playerId: player.id,
      team,
      eloBefore: player.elo,
      eloAfter: eloAfterMap.get(player.id) ?? player.elo,
    }));

    await this.matchRepo.save({
      id: match.id,
      date: match.date,
      winner: match.winner,
      goalDifference: match.goalDifference,
      season: match.season,
      matchPlayers,
    });

    return match;
  }

  async findAll(season?: number): Promise<Match[]> {
    const entities = await this.matchRepo.find({
      relations: ['matchPlayers', 'matchPlayers.player'],
      order: { date: 'DESC' },
      ...(season !== undefined ? { where: { season } } : {}),
    });

    return entities.map((e) => {
      const teamAMps = e.matchPlayers.filter((mp) => mp.team === 'A');
      const teamBMps = e.matchPlayers.filter((mp) => mp.team === 'B');

      const toPlayer = (mp: MatchPlayerEntity): Player =>
        new Player(
          mp.player.id,
          mp.player.name,
          mp.eloBefore,
          mp.player.initialElo,
          mp.player.totalMatchesPlayed,
          mp.player.winCount,
          mp.player.lossCount,
          mp.player.drawCount,
          mp.player.goalsFor,
          mp.player.goalsAgainst,
          [],
        );

      return new Match(
        e.id,
        e.date,
        new Team(`${e.id}-A`, teamAMps.map(toPlayer)),
        new Team(`${e.id}-B`, teamBMps.map(toPlayer)),
        e.winner as 'A' | 'B' | 'draw',
        e.goalDifference,
        e.season,
      );
    });
  }
}
