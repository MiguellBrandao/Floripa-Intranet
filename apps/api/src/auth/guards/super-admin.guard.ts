import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      user?: { is_super_admin?: boolean };
    }>();

    if (!request.user?.is_super_admin) {
      throw new ForbiddenException(
        'Only platform super admins can access this resource',
      );
    }

    return true;
  }
}
