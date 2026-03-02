import { IsString, IsInt, Min, IsNotEmpty } from 'class-validator';

export class CreatePlayerDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(0)
  initialElo!: number;
}
