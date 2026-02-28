import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CreatePlayerUseCase } from '@application/use-cases/create-player.usecase';
import { GetAllPlayersUseCase } from '@application/use-cases/get-all-players.usecase';
import { UpdatePlayerEloUseCase } from '@application/use-cases/update-player-elo.usecase';
import { CreatePlayerDto } from '@application/dto/create-player.dto';
import { Player } from '@domain/entities/player';
import { GetPlayersRankingUseCase } from '@application/use-cases/get-players-ranking.usecase';
import { ClerkAdminGuard } from '../guards/clerk-admin.guard';

@Controller('players')
export class PlayerController {
  constructor(
    private readonly createPlayerUseCase: CreatePlayerUseCase,
    private readonly getAllPlayersUseCase: GetAllPlayersUseCase,
    private readonly getPlayersRanking: GetPlayersRankingUseCase,
    private readonly updatePlayerEloUseCase: UpdatePlayerEloUseCase,
  ) {}

  @Post()
  @UseGuards(ClerkAdminGuard)
  async create(@Body() dto: CreatePlayerDto): Promise<Player> {
    return this.createPlayerUseCase.execute(dto);
  }

  @Get()
  async findAll(): Promise<Player[]> {
    return this.getAllPlayersUseCase.execute();
  }

  @Get('ranking')
  async getRanking() {
    return this.getPlayersRanking.execute();
  }

  @Patch(':id/elo')
  @UseGuards(ClerkAdminGuard)
  async updateElo(@Param('id') id: string, @Body('elo') elo: number, @Req() req: any): Promise<void> {
    return this.updatePlayerEloUseCase.execute(id, elo, req.adminEmail);
  }
}
