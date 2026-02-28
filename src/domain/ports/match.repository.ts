import { Match } from '@domain/entities/match';

export interface MatchRepository {
  save(match: Match): Promise<Match>;
  findAll(season?: number): Promise<Match[]>;
}
