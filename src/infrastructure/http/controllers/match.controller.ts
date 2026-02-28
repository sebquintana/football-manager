import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CreateMatchUseCase } from '@application/use-cases/create-match.usecase';
import { CreateMatchDto } from '@application/dto/create-match.dto';
import { ClerkAdminGuard } from '../guards/clerk-admin.guard';

@Controller('match')
export class MatchController {
  constructor(private readonly createMatchUseCase: CreateMatchUseCase) {}

  @Post()
  @UseGuards(ClerkAdminGuard)
  async createMatch(@Body() createMatchDto: CreateMatchDto) {
    return this.createMatchUseCase.execute(createMatchDto);
  }
}
