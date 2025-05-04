import { Player } from '@domain/entities/player';
import { TeamBalanceService } from '@domain/services/team-balance.service';
import { MinimumPlayersError, PlayerNotFoundError } from '@domain/errors/custom.errors';
import { TypeOrmPlayerRepository } from '@infrastructure/adapters/persistence/typeorm-player-repository';

jest.mock('@infrastructure/adapters/persistence/typeorm-player-repository');

describe('TeamBalanceService', () => {
  let service: TeamBalanceService;
  let mockRepository: jest.Mocked<TypeOrmPlayerRepository>;

  beforeEach(() => {
    mockRepository = new TypeOrmPlayerRepository({} as any) as jest.Mocked<TypeOrmPlayerRepository>;
    service = new TeamBalanceService(mockRepository);
  });

  it('should generate two balanced teams with Nico and Nahue separated', async () => {
    const players = [
      'Nico',
      'Nahue',
      'Santi',
      'Luca',
      'Seba Q',
      'Mati P',
      'Colu',
      'Kevin',
      'Naza',
      'Axel',
    ];

    mockRepository.findByName = jest.fn((name: string) => {
      const playersData: Record<string, Player> = {
        Nico: new Player('1', 'Nico', 976),
        Nahue: new Player('2', 'Nahue', 944),
        Santi: new Player('3', 'Santi', 1026),
        Luca: new Player('4', 'Luca', 1016),
        'Seba Q': new Player('5', 'Seba Q', 1014),
        'Mati P': new Player('6', 'Mati P', 1004),
        Colu: new Player('7', 'Colu', 1000),
        Kevin: new Player('8', 'Kevin', 980),
        Naza: new Player('9', 'Naza', 964),
        Axel: new Player('10', 'Axel', 954),
      };
      return Promise.resolve(playersData[name]);
    });

    const { teamA, teamB, difference } = await service.generateBalancedTeams(players);

    const nicoTeam = teamA.includes('Nico') ? 'A' : 'B';
    const nahueTeam = teamA.includes('Nahue') ? 'A' : 'B';

    expect(nicoTeam).not.toEqual(nahueTeam);
    expect(teamA.length).toBe(5);
    expect(teamB.length).toBe(5);
    expect(difference).toBeLessThanOrEqual(10);
  });

  it('should throw a MinimumPlayersError if there are fewer than 10 players', async () => {
    const players = ['Player1', 'Player2', 'Player3'];

    await expect(service.generateBalancedTeams(players)).rejects.toThrow(MinimumPlayersError);
  });

  it('should throw a PlayerNotFoundError if player not exist in database', async () => {
    const players = [
      'JuanRomanRiquelme',
      'Nahue',
      'Santi',
      'Luca',
      'Seba Q',
      'Mati P',
      'Colu',
      'Kevin',
      'Naza',
      'Axel',
    ];

    mockRepository.findByName = jest.fn((name: string) => {
      const playersData: Record<string, Player> = {
        Axel: new Player('10', 'Axel', 954),
      };
      return Promise.resolve(playersData[name]);
    });

    await expect(service.generateBalancedTeams(players)).rejects.toThrow(PlayerNotFoundError);
  });
});
