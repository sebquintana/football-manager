export interface PendingMatch {
  id: string;
  teamANames: string[];
  teamBNames: string[];
  createdAt: Date;
}

export interface PendingMatchRepository {
  save(pending: PendingMatch): Promise<PendingMatch>;
  findLatest(): Promise<PendingMatch | null>;
  findById(id: string): Promise<PendingMatch | null>;
  delete(id: string): Promise<void>;
}
