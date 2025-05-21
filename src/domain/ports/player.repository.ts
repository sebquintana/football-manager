import { Player } from '../entities/player';

export interface PlayerRepository {
  save(player: Player): Promise<Player>;
  findAll(): Promise<Player[]>;
}
