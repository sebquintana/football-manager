export class Player {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly elo: number,
    readonly initialElo: number = 0,
  ) {}
}
