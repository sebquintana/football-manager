import { Body, Controller, Post } from '@nestjs/common';
import { CreatePlayerUseCase } from '@application/use-cases/create-player.usecase';
import { CreatePlayerDto } from '@application/dto/create-player.dto';
import { Player } from '@domain/entities/player';

@Controller('players')
export class PlayerController {
  constructor(private readonly createPlayerUseCase: CreatePlayerUseCase) {}

  @Post()
  async create(@Body() dto: CreatePlayerDto): Promise<Player> {
    return this.createPlayerUseCase.execute(dto);
  }
}
