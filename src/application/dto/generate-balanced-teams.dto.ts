import { IsArray, ArrayMinSize, ArrayMaxSize, IsUUID } from 'class-validator';

export class GenerateBalancedTeamsDto {
  @IsArray()
  @ArrayMinSize(10)
  @ArrayMaxSize(10)
  @IsUUID('all', { each: true })
  playerNames!: string[];
}
