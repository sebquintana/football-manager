import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { verifyToken, createClerkClient } from '@clerk/backend';

@Injectable()
export class ClerkAdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authorization token');
    }

    const token = authHeader.slice(7);

    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      const adminUser = await clerk.users.getUser(payload.sub);
      const role = (adminUser.publicMetadata as { role?: string })?.role;
      if (role !== 'admin') {
        throw new ForbiddenException('Admin role required');
      }
      request.adminEmail = adminUser.primaryEmailAddress?.emailAddress ?? payload.sub;
      return true;
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
