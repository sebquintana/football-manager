import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PendingMatchRepository } from '@domain/ports/pending-match.repository';
import { CreateMatchUseCase } from './create-match.usecase';
import { ConfirmPendingMatchDto } from '../dto/confirm-pending-match.dto';

@Injectable()
export class ConfirmPendingMatchUseCase {
  constructor(
    @Inject('PendingMatchRepository')
    private readonly pendingMatchRepository: PendingMatchRepository,
    private readonly createMatchUseCase: CreateMatchUseCase,
  ) {}

  async execute(dto: ConfirmPendingMatchDto) {
    const pending = await this.pendingMatchRepository.findById(dto.id);
    if (!pending) throw new NotFoundException('Pending match not found');

    const match = await this.createMatchUseCase.execute({
      teamANames: dto.teamANames,
      teamBNames: dto.teamBNames,
      winner: dto.winner,
      goalDifference: dto.goalDifference,
      date: dto.date,
    });

    await this.pendingMatchRepository.delete(dto.id);
    return match;
  }
}
