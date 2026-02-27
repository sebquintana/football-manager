import { IsArray, ArrayMinSize, ArrayMaxSize, IsString } from 'class-validator';

export class GenerateBalancedTeamsDto {
  @IsArray()
  @ArrayMinSize(10)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  playerNames!: string[];
}
