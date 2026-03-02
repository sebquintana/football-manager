import { Injectable, Inject } from '@nestjs/common';
import { PendingMatchRepository } from '@domain/ports/pending-match.repository';
import { SavePendingMatchDto } from '../dto/save-pending-match.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SavePendingMatchUseCase {
  constructor(
    @Inject('PendingMatchRepository')
    private readonly pendingMatchRepository: PendingMatchRepository,
  ) {}

  async execute(dto: SavePendingMatchDto) {
    const pending = {
      id: uuidv4(),
      teamANames: dto.teamANames,
      teamBNames: dto.teamBNames,
      createdAt: new Date(),
    };
    return this.pendingMatchRepository.save(pending);
  }
}
