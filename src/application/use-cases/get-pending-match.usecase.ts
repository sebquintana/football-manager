import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PendingMatchRepository } from '@domain/ports/pending-match.repository';

@Injectable()
export class GetPendingMatchUseCase {
  constructor(
    @Inject('PendingMatchRepository')
    private readonly pendingMatchRepository: PendingMatchRepository,
  ) {}

  async execute() {
    const pending = await this.pendingMatchRepository.findLatest();
    if (!pending) throw new NotFoundException('No pending match found');
    return pending;
  }
}
