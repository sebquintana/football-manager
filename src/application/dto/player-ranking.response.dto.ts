export class PlayerEloDTO {
  position!: number;
  name!: string;
  elo!: number;
  recentForm!: ('V' | 'D' | 'E')[];
}
