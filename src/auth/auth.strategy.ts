import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@songkeys/nestjs-redis';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private redisService: RedisService, private jwtService: JwtService) {
    const secret = config.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not defined in .env');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: any) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    if (!token) throw new UnauthorizedException('Invalid access token!');

    const userIdInRedis = await this.redisService.getClient().get(token);
    if (!userIdInRedis) throw new UnauthorizedException('Invalid or expired access token!');

    const decoded = this.jwtService.verify(token, { secret: process.env.JWT_ACCESS_SECRET });
    if (!decoded) throw new UnauthorizedException('Invalid access token!');
    return { userId: decoded.sub, email: decoded.email, otpVerified: decoded.otpVerified };
  }
}
