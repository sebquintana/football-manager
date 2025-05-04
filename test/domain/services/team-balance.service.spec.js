"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const player_entity_1 = require("../../../src/domain/entities/player.entity");
const team_balance_service_1 = require("../../../src/domain/services/team-balance.service");
const custom_errors_1 = require("../../../src/domain/errors/custom.errors");
const typeorm_player_repository_1 = require("../../../src/infrastructure/adapters/persistence/typeorm-player-repository");
jest.mock('@infrastructure/adapters/persistence/typeorm-player-repository');
describe('TeamBalanceService', () => {
    let service;
    let mockRepository;
    beforeEach(() => {
        mockRepository = new typeorm_player_repository_1.TypeOrmPlayerRepository({});
        service = new team_balance_service_1.TeamBalanceService(mockRepository);
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
        mockRepository.findByName = jest.fn((name) => {
            const playersData = {
                Nico: new player_entity_1.Player('1', 'Nico', 976),
                Nahue: new player_entity_1.Player('2', 'Nahue', 944),
                Santi: new player_entity_1.Player('3', 'Santi', 1026),
                Luca: new player_entity_1.Player('4', 'Luca', 1016),
                'Seba Q': new player_entity_1.Player('5', 'Seba Q', 1014),
                'Mati P': new player_entity_1.Player('6', 'Mati P', 1004),
                Colu: new player_entity_1.Player('7', 'Colu', 1000),
                Kevin: new player_entity_1.Player('8', 'Kevin', 980),
                Naza: new player_entity_1.Player('9', 'Naza', 964),
                Axel: new player_entity_1.Player('10', 'Axel', 954),
            };
            return Promise.resolve(playersData[name]);
        });
        const { teamA, teamB, difference } = await service.generateBalancedTeams(players);
        const nicoTeam = teamA.find((p) => p.name === 'Nico') ? 'A' : 'B';
        const nahueTeam = teamA.find((p) => p.name === 'Nahue') ? 'A' : 'B';
        expect(nicoTeam).not.toEqual(nahueTeam);
        expect(teamA.length).toBe(5);
        expect(teamB.length).toBe(5);
        expect(difference).toBeLessThanOrEqual(10);
    });
    it('should throw a MinimumPlayersError if there are fewer than 10 players', async () => {
        const players = ['Player1', 'Player2', 'Player3'];
        await expect(service.generateBalancedTeams(players)).rejects.toThrow(custom_errors_1.MinimumPlayersError);
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
        mockRepository.findByName = jest.fn((name) => {
            const playersData = {
                Axel: new player_entity_1.Player('10', 'Axel', 954),
            };
            return Promise.resolve(playersData[name]);
        });
        await expect(service.generateBalancedTeams(players)).rejects.toThrow(custom_errors_1.PlayerNotFoundError);
    });
});
