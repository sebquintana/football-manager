import { Player } from '@domain/entities/player';

export interface PlayerRepository {
  findByName(name: string): Promise<Player>;
  findById(id: string): Promise<Player>;
  save(player: Player): Promise<void>;
}
