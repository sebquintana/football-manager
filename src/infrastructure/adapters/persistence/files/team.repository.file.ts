import { promises as fs } from 'fs';
import path from 'path';
import { Team } from '@domain/entities/team';
import { Player } from '@domain/entities/player';

const filePath = path.resolve(process.cwd(), 'data/team-db.json');

export class FileTeamRepository {
  async save(team: Team): Promise<Team> {
    const teams = await this.findAll();
    const updated = teams.filter(t => t.id !== team.id);
    updated.push(team);
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2));
    return team;
  }

  async findAll(): Promise<Team[]> {
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(raw);
      return data.map((t: any) => new Team(
        t.id,
        t.players.map((p: any) => new Player(
          p.id, p.name, p.elo, p.initialElo, p.totalMatchesPlayed,
          p.winCount, p.lossCount, p.drawCount, p.goalsFor, p.goalsAgainst, p.history
        ))
      ));
    } catch (err: any) {
      if (err.code === 'ENOENT') return [];
      throw err;
    }
  }
}
