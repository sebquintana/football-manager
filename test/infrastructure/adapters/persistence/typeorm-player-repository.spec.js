"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const player_entity_1 = require("../../../../src/domain/entities/player.entity");
const player_persistence_1 = require("../../../../src/infrastructure/adapters/persistence/player.persistence");
const typeorm_player_repository_1 = require("../../../../src/infrastructure/adapters/persistence/typeorm-player-repository");
const mockPlayerPersistence = {
    id: '1',
    name: 'John Doe',
    elo: 1200,
    initialElo: 1000,
};
const mockPlayer = new player_entity_1.Player('1', 'John Doe', 1200, 1000);
describe('TypeOrmPlayerRepository', () => {
    let repository;
    let playerRepositoryMock;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                typeorm_player_repository_1.TypeOrmPlayerRepository,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(player_persistence_1.PlayerPersistence),
                    useValue: {
                        findOne: jest.fn(),
                        save: jest.fn(),
                    },
                },
            ],
        }).compile();
        repository = module.get(typeorm_player_repository_1.TypeOrmPlayerRepository);
        playerRepositoryMock = module.get((0, typeorm_1.getRepositoryToken)(player_persistence_1.PlayerPersistence));
    });
    it('should find a player by id', async () => {
        playerRepositoryMock.findOne.mockResolvedValue(mockPlayerPersistence);
        const result = await repository.findById('1');
        expect(playerRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
        expect(result).toEqual(mockPlayer);
    });
    it('should find a player by name', async () => {
        playerRepositoryMock.findOne.mockResolvedValue(mockPlayerPersistence);
        const result = await repository.findByName('John Doe');
        expect(playerRepositoryMock.findOne).toHaveBeenCalledWith({ where: { name: 'John Doe' } });
        expect(result).toEqual(mockPlayer);
    });
    it('should save a player', async () => {
        playerRepositoryMock.save.mockResolvedValue(mockPlayerPersistence);
        await repository.save(mockPlayer);
        expect(playerRepositoryMock.save).toHaveBeenCalledWith({
            id: '1',
            name: 'John Doe',
            elo: 1200,
            initialElo: 1000,
        });
    });
});
