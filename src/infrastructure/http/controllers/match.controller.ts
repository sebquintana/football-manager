import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateMatchUseCase } from '@application/use-cases/create-match.usecase';
import { SavePendingMatchUseCase } from '@application/use-cases/save-pending-match.usecase';
import { GetPendingMatchUseCase } from '@application/use-cases/get-pending-match.usecase';
import { ConfirmPendingMatchUseCase } from '@application/use-cases/confirm-pending-match.usecase';
import { DeletePendingMatchUseCase } from '@application/use-cases/delete-pending-match.usecase';
import { CreateMatchDto } from '@application/dto/create-match.dto';
import { SavePendingMatchDto } from '@application/dto/save-pending-match.dto';
import { ConfirmPendingMatchDto } from '@application/dto/confirm-pending-match.dto';
import { ClerkAdminGuard } from '../guards/clerk-admin.guard';

@Controller('match')
export class MatchController {
  constructor(
    private readonly createMatchUseCase: CreateMatchUseCase,
    private readonly savePendingMatchUseCase: SavePendingMatchUseCase,
    private readonly getPendingMatchUseCase: GetPendingMatchUseCase,
    private readonly confirmPendingMatchUseCase: ConfirmPendingMatchUseCase,
    private readonly deletePendingMatchUseCase: DeletePendingMatchUseCase,
  ) {}

  @Post()
  @UseGuards(ClerkAdminGuard)
  async createMatch(@Body() createMatchDto: CreateMatchDto) {
    return this.createMatchUseCase.execute(createMatchDto);
  }

  @Post('pending')
  @UseGuards(ClerkAdminGuard)
  async savePendingMatch(@Body() dto: SavePendingMatchDto) {
    return this.savePendingMatchUseCase.execute(dto);
  }

  @Get('pending/latest')
  @UseGuards(ClerkAdminGuard)
  async getLatestPendingMatch() {
    return this.getPendingMatchUseCase.execute();
  }

  @Patch('pending/:id/result')
  @UseGuards(ClerkAdminGuard)
  async confirmPendingMatch(@Param('id') id: string, @Body() dto: Omit<ConfirmPendingMatchDto, 'id'>) {
    return this.confirmPendingMatchUseCase.execute({ ...dto, id });
  }

  @Delete('pending/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ClerkAdminGuard)
  async deletePendingMatch(@Param('id') id: string) {
    return this.deletePendingMatchUseCase.execute(id);
  }
}
