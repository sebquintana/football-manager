import { Test, TestingModule } from '@nestjs/testing';
import { TeamBalanceController } from '@infrastructure/http/controllers/team-balance.controller';
import { TeamBalanceService } from '@domain/services/team-balance.service';
import { GenerateBalancedTeamsUseCase } from '@application/generate-balanced-teams.usecase';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlayerPersistence } from '@infrastructure/adapters/persistence/player.entity';
import { PlayerNamesDTO } from '@infrastructure/http/controllers/dto/players-names.dto';

const mockTeamBalanceService = {
  generateBalancedTeams: jest.fn(),
};

describe('TeamBalanceController', () => {
  let controller: TeamBalanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamBalanceController],
      providers: [
        {
          provide: TeamBalanceService,
          useValue: mockTeamBalanceService,
        },
        GenerateBalancedTeamsUseCase,
        {
          provide: getRepositoryToken(PlayerPersistence),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<TeamBalanceController>(TeamBalanceController);
  });

  describe('generateBalancedTeams', () => {
    it('should call TeamBalanceService with transformed players', async () => {
      const mockDto: PlayerNamesDTO = {
        names: [
          'Player 1',
          'Player 2',
          'Player 3',
          'Player 4',
          'Player 5',
          'Player 6',
          'Player 7',
          'Player 8',
          'Player 9',
          'Player 10',
        ],
      };

      mockTeamBalanceService.generateBalancedTeams.mockResolvedValue({
        difference: 50,
      });

      const result = await controller.generateBalancedTeams(mockDto);

      expect(mockTeamBalanceService.generateBalancedTeams).toHaveBeenCalledWith(mockDto.names);
      expect(result.difference).toBeLessThanOrEqual(100);
    });

    it('should throw an error if less than 10 players are provided', async () => {
      const mockDto: PlayerNamesDTO = { names: ['Player 1', 'Player 2'] };

      mockTeamBalanceService.generateBalancedTeams.mockRejectedValue(
        new Error('A minimum of 10 players is required to generate balanced teams.'),
      );

      await expect(controller.generateBalancedTeams(mockDto)).rejects.toThrow(
        'A minimum of 10 players is required to generate balanced teams.',
      );
    });
  });
});
