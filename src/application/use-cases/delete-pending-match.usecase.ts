import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PendingMatchRepository } from '@domain/ports/pending-match.repository';

@Injectable()
export class DeletePendingMatchUseCase {
  constructor(
    @Inject('PendingMatchRepository')
    private readonly pendingMatchRepository: PendingMatchRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const pending = await this.pendingMatchRepository.findById(id);
    if (!pending) throw new NotFoundException('Pending match not found');
    await this.pendingMatchRepository.delete(id);
  }
}
