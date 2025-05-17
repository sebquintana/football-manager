import { Injectable } from '@nestjs/common';
import { MatchService } from '@domain/services/match.service';
import { Match } from '@domain/entities/match';
import { MatchDTO } from '@infrastructure/http/controllers/dto/match.dto';

@Injectable()
export class SaveMatchUseCase {
  constructor(private readonly matchService: MatchService) {}

  async execute(match: MatchDTO): Promise<Match> {
    return this.matchService.saveMatch(match.matchDate, match.teamWinner, match.goalDifference);
  }
}
