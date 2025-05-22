import { IsArray, IsDateString, IsEnum, IsInt, Min, ArrayMinSize } from 'class-validator';

export class CreateMatchDto {
  @IsArray()
  @ArrayMinSize(5)
  teamANames!: string[];

  @IsArray()
  @ArrayMinSize(5)
  teamBNames!: string[];

  @IsEnum(['A', 'B', 'draw'])
  winner!: 'A' | 'B' | 'draw';

  @IsInt()
  @Min(0)
  goalDifference!: number;

  @IsDateString()
  date!: string;
}
