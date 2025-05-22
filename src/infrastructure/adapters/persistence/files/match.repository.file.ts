import { MatchRepository } from '@domain/ports/match.repository';
import { Match } from '@domain/entities/match';
import { Player } from '@domain/entities/player';
import { Team } from '@domain/entities/team';
import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.resolve(process.cwd(), 'data/match-db.json');

export class FileMatchRepository implements MatchRepository {
  async save(match: Match): Promise<Match> {
    const matches = await this.findAll();
    matches.push(match);
    await fs.writeFile(filePath, JSON.stringify(matches, null, 2));
    return match;
  }

  async findAll(): Promise<Match[]> {
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(raw);
      return data.map((m: any) => new Match(
        m.id,
        new Date(m.date),
        new Team(m.teamA.id, m.teamA.players.map((p: Player) => new Player(
          p.id, p.name, p.elo, p.initialElo, p.totalMatchesPlayed,
          p.winCount, p.lossCount, p.drawCount, p.goalsFor, p.goalsAgainst, p.history
        ))),
        new Team(m.teamB.id, m.teamB.players.map((p: Player) => new Player(
          p.id, p.name, p.elo, p.initialElo, p.totalMatchesPlayed,
          p.winCount, p.lossCount, p.drawCount, p.goalsFor, p.goalsAgainst, p.history
        ))),
        m.winner,
        m.goalDifference
      ));
    } catch (err: any) {
      if (err.code === 'ENOENT') return [];
      throw err;
    }
  }
}
