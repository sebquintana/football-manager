import { PlayerRepository } from '@domain/ports/player.repository';
import { Player } from '@domain/entities/player';
import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.resolve(process.cwd(), 'data/player-db.json');

export class FilePlayerRepository implements PlayerRepository {
  async save(player: Player): Promise<Player> {
    const players = await this.findAll();
    const updated = players.filter(p => p.id !== player.id);
    updated.push(player);
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2));
    return player;
  }

  async findAll(): Promise<Player[]> {
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(raw);
      return data.map((p: any) => new Player(
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
        p.history
      ));
    } catch (err: any) {
      if (err.code === 'ENOENT') return [];
      throw err;
    }
  }
}
