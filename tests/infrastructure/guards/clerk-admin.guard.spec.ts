import { ClerkAdminGuard } from '@infrastructure/http/guards/clerk-admin.guard';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { verifyToken, createClerkClient } from '@clerk/backend';

jest.mock('@clerk/backend', () => ({
  verifyToken: jest.fn(),
  createClerkClient: jest.fn(),
}));

const mockVerifyToken = verifyToken as jest.Mock;
const mockCreateClerkClient = createClerkClient as jest.Mock;

describe('ClerkAdminGuard', () => {
  let guard: ClerkAdminGuard;

  const buildContext = (authHeader?: string) => {
    const request: any = {
      headers: authHeader ? { authorization: authHeader } : {},
    };
    return {
      switchToHttp: () => ({ getRequest: () => request }),
      request,
    };
  };

  beforeEach(() => {
    guard = new ClerkAdminGuard();
    jest.clearAllMocks();
  });

  it('should throw UnauthorizedException when Authorization header is missing', async () => {
    const ctx = buildContext();
    await expect(guard.canActivate(ctx as any)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when token does not start with Bearer', async () => {
    const ctx = buildContext('Basic sometoken');
    await expect(guard.canActivate(ctx as any)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when token is invalid', async () => {
    mockVerifyToken.mockRejectedValue(new Error('Invalid token'));
    const ctx = buildContext('Bearer invalidtoken');
    await expect(guard.canActivate(ctx as any)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw ForbiddenException when role is not admin', async () => {
    mockVerifyToken.mockResolvedValue({
      sub: 'user_123',
      publicMetadata: { role: 'user' },
    });
    const ctx = buildContext('Bearer validtoken');
    await expect(guard.canActivate(ctx as any)).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when role is missing', async () => {
    mockVerifyToken.mockResolvedValue({
      sub: 'user_123',
      publicMetadata: {},
    });
    const ctx = buildContext('Bearer validtoken');
    await expect(guard.canActivate(ctx as any)).rejects.toThrow(ForbiddenException);
  });

  it('should return true and set adminEmail when role is admin', async () => {
    mockVerifyToken.mockResolvedValue({
      sub: 'user_123',
      publicMetadata: { role: 'admin' },
    });
    const mockGetUser = jest.fn().mockResolvedValue({
      primaryEmailAddress: { emailAddress: 'admin@example.com' },
    });
    mockCreateClerkClient.mockReturnValue({ users: { getUser: mockGetUser } });

    const ctx = buildContext('Bearer validtoken');
    const result = await guard.canActivate(ctx as any);

    expect(result).toBe(true);
    expect(ctx.request.adminEmail).toBe('admin@example.com');
    expect(mockGetUser).toHaveBeenCalledWith('user_123');
  });

  it('should fallback to userId when primaryEmailAddress is null', async () => {
    mockVerifyToken.mockResolvedValue({
      sub: 'user_123',
      publicMetadata: { role: 'admin' },
    });
    const mockGetUser = jest.fn().mockResolvedValue({ primaryEmailAddress: null });
    mockCreateClerkClient.mockReturnValue({ users: { getUser: mockGetUser } });

    const ctx = buildContext('Bearer validtoken');
    await guard.canActivate(ctx as any);

    expect(ctx.request.adminEmail).toBe('user_123');
  });
});
