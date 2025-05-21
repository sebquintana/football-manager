import { IsString, IsInt, Min } from 'class-validator';

export class CreatePlayerDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  initialElo: number;
}
