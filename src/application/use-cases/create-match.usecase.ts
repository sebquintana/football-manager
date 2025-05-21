import { Injectable, Inject } from '@nestjs/common';
import { Match } from '@domain/entities/match';
import { Team } from '@domain/entities/team';
import { PlayerRepository } from '@domain/ports/player.repository';
import { MatchRepository } from '@domain/ports/match.repository';
import { CreateMatchDto } from '../dto/create-match.dto';
import { v4 as uuidv4 } from 'uuid';
import { Player } from '@domain/entities/player';

@Injectable()
export class CreateMatchUseCase {
  constructor(
    @Inject('PlayerRepository')
    private readonly playerRepository: PlayerRepository,
    @Inject('MatchRepository')
    private readonly matchRepository: MatchRepository,
  ) {}

  async execute(dto: CreateMatchDto): Promise<Match> {
    const allPlayers = await this.playerRepository.findAll();

    // TODO: Quiza se podrian crear en base al nombre de los jugadores y no el id.
    const teamAPlayers = dto.teamAIds.map(id => this.findPlayer(id, allPlayers));
    const teamBPlayers = dto.teamBIds.map(id => this.findPlayer(id, allPlayers));

    const teamA = new Team(uuidv4(), teamAPlayers);
    const teamB = new Team(uuidv4(), teamBPlayers);

    const match = new Match(
      uuidv4(),
      new Date(dto.date),
      teamA,
      teamB,
      dto.winner,
      dto.goalDifference,
    );

    // Acá actualizarías ELOs y estadísticas de cada jugador
    // Podés hacerlo con un EloService o en una fase siguiente

    await this.matchRepository.save(match);
    return match;
  }

  // TODO: Mover a un player.domain-service.ts
  private findPlayer(id: string, allPlayers: Player[]): Player {
    const player = allPlayers.find(p => p.id === id);
    if (!player) throw new Error(`Player ${id} not found`);
    return player;
  }
}
