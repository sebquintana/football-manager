import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchRepository } from '@domain/ports/match.repository';
import { Match } from '@domain/entities/match';
import { Team } from '@domain/entities/team';
import { Player } from '@domain/entities/player';
import { EloChange } from '@domain/entities/elo-change';
import { MatchEntity } from './entities/match.entity';

@Injectable()
export class TypeOrmMatchRepository implements MatchRepository {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly repo: Repository<MatchEntity>,
  ) {}

  async save(match: Match): Promise<Match> {
    const toSnapshot = (team: Team) => ({
      id: team.id,
      players: team.players.map((p) => ({
        id: p.id,
        name: p.name,
        elo: p.elo,
        initialElo: p.initialElo,
        totalMatchesPlayed: p.totalMatchesPlayed,
        winCount: p.winCount,
        lossCount: p.lossCount,
        drawCount: p.drawCount,
        goalsFor: p.goalsFor,
        goalsAgainst: p.goalsAgainst,
        history: p.history.map((h) => ({
          oldElo: h.oldElo,
          newElo: h.newElo,
          changedAt: h.changedAt.toISOString(),
          matchId: h.matchId,
        })),
      })),
    });

    await this.repo.save({
      id: match.id,
      date: match.date,
      winner: match.winner,
      goalDifference: match.goalDifference,
      teamA: toSnapshot(match.teamA),
      teamB: toSnapshot(match.teamB),
    });

    return match;
  }

  async findAll(): Promise<Match[]> {
    const entities = await this.repo.find({ order: { date: 'DESC' } });

    const toPlayer = (p: any): Player =>
      new Player(
        p.id,
        p.name,
        p.elo,
        p.initialElo,
        p.totalMatchesPlayed,
        p.winCount,
        p.lossCount,
        p.drawCount,
        p.goalsFor,
        p.goalsAgainst,
        (p.history ?? []).map(
          (h: any) => new EloChange(h.oldElo, h.newElo, new Date(h.changedAt), h.matchId),
        ),
      );

    return entities.map(
      (e) =>
        new Match(
          e.id,
          e.date,
          new Team(e.teamA.id, e.teamA.players.map(toPlayer)),
          new Team(e.teamB.id, e.teamB.players.map(toPlayer)),
          e.winner as 'A' | 'B' | 'draw',
          e.goalDifference,
        ),
    );
  }
}
