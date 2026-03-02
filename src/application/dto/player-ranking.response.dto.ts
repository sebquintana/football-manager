export class PlayerEloDTO {
  position!: number;
  name!: string;
  elo!: number;
  recentForm!: ('W' | 'L' | 'D')[];
}
