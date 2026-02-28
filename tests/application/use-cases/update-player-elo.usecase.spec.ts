import { UpdatePlayerEloUseCase } from '@application/use-cases/update-player-elo.usecase';
import { PlayerRepository } from '@domain/ports/player.repository';
import { Player } from '@domain/entities/player';
import { NotFoundException } from '@nestjs/common';

const buildPlayer = (id: string, elo: number = 1000) =>
  new Player(id, 'Axel', elo, elo, 5, 3, 1, 1, 10, 8, []);

describe('UpdatePlayerEloUseCase', () => {
  let useCase: UpdatePlayerEloUseCase;
  let mockPlayerRepo: jest.Mocked<PlayerRepository>;

  beforeEach(() => {
    mockPlayerRepo = { findAll: jest.fn(), save: jest.fn() };
    useCase = new UpdatePlayerEloUseCase(mockPlayerRepo);
  });

  it('should throw NotFoundException when player does not exist', async () => {
    mockPlayerRepo.findAll.mockResolvedValue([buildPlayer('1')]);
    await expect(useCase.execute('nonexistent', 1100, 'admin@test.com')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockPlayerRepo.save).not.toHaveBeenCalled();
  });

  it('should update elo and save player with admin-edit matchId', async () => {
    const player = buildPlayer('player-1', 1000);
    mockPlayerRepo.findAll.mockResolvedValue([player]);

    await useCase.execute('player-1', 1100, 'admin@test.com');

    expect(mockPlayerRepo.save).toHaveBeenCalledTimes(1);
    const savedPlayer: Player = (mockPlayerRepo.save as jest.Mock).mock.calls[0][0];
    expect(savedPlayer.elo).toBe(1100);
    expect(savedPlayer.history).toHaveLength(1);
    expect(savedPlayer.history[0].matchId).toBe('admin-edit:admin@test.com');
    expect(savedPlayer.history[0].oldElo).toBe(1000);
    expect(savedPlayer.history[0].newElo).toBe(1100);
  });

  it('should not mutate the original player', async () => {
    const player = buildPlayer('player-1', 1000);
    mockPlayerRepo.findAll.mockResolvedValue([player]);

    await useCase.execute('player-1', 1200, 'admin@test.com');

    expect(player.elo).toBe(1000);
    expect(player.history).toHaveLength(0);
  });
});
