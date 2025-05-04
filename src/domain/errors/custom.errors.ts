export class MinimumPlayersError extends Error {
  constructor() {
    super('A minimum of 10 players is required to generate balanced teams.');
    this.name = 'MinimumPlayersError';
  }
}

export class PlayerNotFoundError extends Error {
  constructor(name: string) {
    super(`Player with name ${name} not found.`);
    this.name = 'PlayerNotFoundError';
  }
}
