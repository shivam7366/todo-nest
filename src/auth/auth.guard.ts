import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (err || !user) {
      if (info?.message === 'jwt expired') {
        throw new UnauthorizedException(
          'Your token has expired. Please login again.',
        );
      }
      throw new UnauthorizedException('Authentication failed');
    }
    if (!user.otpVerified) {
      throw new UnauthorizedException('Please verfiy your email first!');
    }
    return user;
  }
}
