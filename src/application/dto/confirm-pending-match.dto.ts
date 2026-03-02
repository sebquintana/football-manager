import { IsArray, IsDateString, IsEnum, IsInt, IsString, ArrayMinSize, Min } from 'class-validator';

export class ConfirmPendingMatchDto {
  @IsString()
  id!: string;

  @IsArray()
  @ArrayMinSize(2)
  teamANames!: string[];

  @IsArray()
  @ArrayMinSize(2)
  teamBNames!: string[];

  @IsEnum(['A', 'B', 'draw'])
  winner!: 'A' | 'B' | 'draw';

  @IsInt()
  @Min(0)
  goalDifference!: number;

  @IsDateString()
  date!: string;
}
