import { Controller, Post, Body } from '@nestjs/common';
import { CreateMatchUseCase } from '@application/use-cases/create-match.usecase';
import { CreateMatchDto } from '@application/dto/create-match.dto';

@Controller('match')
export class MatchController {
  constructor(private readonly createMatchUseCase: CreateMatchUseCase) {}

  @Post()
  async createMatch(@Body() createMatchDto: CreateMatchDto) {
    return this.createMatchUseCase.execute(createMatchDto);
  }
}
