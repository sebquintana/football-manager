export class Player {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly elo: number,
    readonly initialElo: number = 0,
  ) {}

  static create(id: string, name: string, elo: number, initialElo: number = 0): Player {
    return new Player(id, name, elo, initialElo);
  }
  static fromPersistence(data: any): Player {
    return new Player(data.id, data.name, data.elo, data.initialElo);
  }

  updateElo(newElo: number): Player {
    return new Player(this.id, this.name, newElo, this.initialElo);
  }
}
