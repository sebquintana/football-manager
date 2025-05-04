"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const team_balance_controller_1 = require("../../../../src/infrastructure/http/controllers/team-balance.controller");
const team_balance_service_1 = require("../../../../src/domain/services/team-balance.service");
const generate_balanced_teams_usecase_1 = require("../../../../src/application/generate-balanced-teams.usecase");
const typeorm_1 = require("@nestjs/typeorm");
const player_persistence_1 = require("../../../../src/infrastructure/adapters/persistence/player.persistence");
const mockTeamBalanceService = {
    generateBalancedTeams: jest.fn(),
};
describe('TeamBalanceController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [team_balance_controller_1.TeamBalanceController],
            providers: [
                {
                    provide: team_balance_service_1.TeamBalanceService,
                    useValue: mockTeamBalanceService,
                },
                generate_balanced_teams_usecase_1.GenerateBalancedTeamsUseCase,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(player_persistence_1.PlayerPersistence),
                    useValue: {},
                },
            ],
        }).compile();
        controller = module.get(team_balance_controller_1.TeamBalanceController);
    });
    describe('generateBalancedTeams', () => {
        it('should call TeamBalanceService with transformed players', async () => {
            const mockDto = [
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
            ];
            mockTeamBalanceService.generateBalancedTeams.mockResolvedValue({
                difference: 50,
            });
            const result = await controller.generateBalancedTeams(mockDto);
            expect(mockTeamBalanceService.generateBalancedTeams).toHaveBeenCalledWith(mockDto);
            expect(result.difference).toBeLessThanOrEqual(100);
        });
        it('should throw an error if less than 10 players are provided', async () => {
            const mockDto = ['Player 1', 'Player 2'];
            mockTeamBalanceService.generateBalancedTeams.mockRejectedValue(new Error('A minimum of 10 players is required to generate balanced teams.'));
            await expect(controller.generateBalancedTeams(mockDto)).rejects.toThrow('A minimum of 10 players is required to generate balanced teams.');
        });
    });
});
