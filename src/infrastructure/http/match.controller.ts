import { Body, Controller, Post } from '@nestjs/common';
import { CreateMatchDto } from '@application/dto/create-match.dto';
import { CreateMatchUseCase } from '@application/use-cases/create-match.usecase';
import { Match } from '@domain/entities/match';

@Controller('matches')
export class MatchController {
  constructor(private readonly createMatchUseCase: CreateMatchUseCase) {}

  @Post()
  async create(@Body() dto: CreateMatchDto): Promise<Match> {
    return this.createMatchUseCase.execute(dto);
  }
}
