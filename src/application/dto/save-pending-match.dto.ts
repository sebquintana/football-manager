import { IsArray, ArrayMinSize } from 'class-validator';

export class SavePendingMatchDto {
  @IsArray()
  @ArrayMinSize(2)
  teamANames!: string[];

  @IsArray()
  @ArrayMinSize(2)
  teamBNames!: string[];
}
