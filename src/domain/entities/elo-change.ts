export class EloChange {
  constructor(
    public readonly oldElo: number,
    public readonly newElo: number,
    public readonly changedAt: Date = new Date(),
    public readonly matchId?: string,
  ) {}
}
