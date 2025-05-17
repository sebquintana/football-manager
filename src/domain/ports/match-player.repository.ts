import { MatchPlayer } from '@domain/entities/match-player';

export interface MatchPlayerRepository {
  saveMatchPlayer(matchPlayer: MatchPlayer): Promise<MatchPlayer>;
}
