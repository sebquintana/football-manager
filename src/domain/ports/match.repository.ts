import { Match } from '@domain/entities/match';

export interface MatchRepository {
  saveMatch(match: Match): Promise<Match>;
}
