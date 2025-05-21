import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreatePlayerUseCase } from '@application/use-cases/create-player.usecase';
import { GetAllPlayersUseCase } from '@application/use-cases/get-all-players.usecase';
import { CreatePlayerDto } from '@application/dto/create-player.dto';
import { Player } from '@domain/entities/player';

@Controller('players')
export class PlayerController {
  constructor(private readonly createPlayerUseCase: CreatePlayerUseCase,
	      private readonly getAllPlayersUseCase: GetAllPlayersUseCase
  ) {}

  @Post()
  async create(@Body() dto: CreatePlayerDto): Promise<Player> {
    return this.createPlayerUseCase.execute(dto);
  }

  @Get()
  async findAll(): Promise<Player[]> {
    return this.getAllPlayersUseCase.execute();
  }	
}
