import { Controller, Post, Body } from '@nestjs/common';
import { SaveMatchUseCase } from '@application/save-match.usecase';
import { MatchDTO } from './dto/match.dto';

@Controller('match')
export class MatchController {
  constructor(private readonly saveMatchUseCase: SaveMatchUseCase) {}

  @Post()
  async saveMatch(@Body() match: MatchDTO) {
    return this.saveMatchUseCase.execute(match);
  }
}
