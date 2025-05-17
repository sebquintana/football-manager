export class Match {
  constructor(
    public id: string,
    public matchDate: string,
    public goalDifference: number,
    public teamWinner: string,
    public createdAt: Date,
  ) {}

  static create(id: string, matchDate: string, goalDifference: number, teamWinner: string): Match {
    return new Match(id, matchDate, goalDifference, teamWinner, new Date());
  }

  static fromPersistence(data: any): Match {
    return new Match(data.id, data.matchDate, data.goalDifference, data.teamWinner, data.createdAt);
  }
}
