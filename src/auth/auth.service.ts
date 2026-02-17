import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { UsersService } from 'src/users/users.service';
import {
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  ResendOtpDto,
  SignupDto,
  VerifyOtpDto,
} from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import passport from 'passport';
import { RedisService } from '@songkeys/nestjs-redis';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private mailService: MailService,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async signup(dto: SignupDto) {
    const user = await this.userService.findUserByEmail(dto.email);
    if (user) throw new ConflictException('User already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = await this.userService.create({
      ...dto,
      password: hashedPassword,
    });
    const otp = await this.generateOtp(newUser?.data?._id?.toString());
    const tokens = await this.getTokens(
      newUser?.data?._id?.toString(),
      dto.email,
      false,
    );
    await this.mailService.sendOtpMail(
      dto.email,
      otp,
      newUser?.data?.firstName,
    );

    return {
      message: 'Signup successful. Please check your email for OTP.',
      ...tokens,
    };
  }

  async resendOtp(dto: ResendOtpDto) {
    const user = await this.userService.findUserByEmail(dto.email);
    if (!user) throw new NotFoundException('User not found');

    const otp = await this.generateOtp(user?._id?.toString());

    await this.mailService.sendOtpMail(dto.email, otp, user?.firstName);
    return {
      message: 'OTP sent. Please check your email for OTP.',
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.userService.findUserByEmail(dto.email);
    if (!user) throw new NotFoundException('User not found');

    const otp = await this.redisService
      .getClient()
      .get(`${user?._id?.toString()}`);

    if (!otp) throw new UnauthorizedException('Invalid or Expired OTP !');
    if (otp !== dto.otp)
      throw new BadRequestException('Invalid or Expired OTP!');
    await this.redisService.getClient().del(`${user?._id?.toString()}`);
    const updatedUser = await this.userService.updateUser(user._id.toString(), {
      otpVerified: true,
    });
    const tokens = await this.getTokens(
      updatedUser.data._id.toString(),
      updatedUser.data.email,
      updatedUser.data.otpVerified,
    );

    // Send Welcome Mail
    await this.mailService.sendWelcomeMail(
      user.email,
      user.firstName,
      'https://shivam-gupta.life',
    );
    return {
      ...tokens,
      data: updatedUser.data,
      message: 'Account verified successfully!',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findUserByEmail(dto.email, true);
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials!');
    }
    const isAuthenticated = await bcrypt.compare(dto.password, user.password);
    if (!isAuthenticated) {
      throw new UnauthorizedException('Invalid Credentials!');
    }
    if (!user.otpVerified) {
      throw new UnauthorizedException('Please verify OTP first');
    }
    const tokens = await this.getTokens(
      user._id.toString(),
      user.email,
      user.otpVerified,
    );

    return {
      message: 'Login successful!',
      ...tokens,
      data: user,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    const { refresh_token } = dto;
    const userId = await this.redisService.getClient().get(refresh_token);
    if (!userId) throw new UnauthorizedException('Invalid refresh token!');
    const decoded = this.jwtService.verify(refresh_token, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    if (!decoded) throw new UnauthorizedException('Invalid refresh token!');
    const at = await this.getTokens(userId, decoded.email, decoded.otpVerified);
    return { ...at, message: 'Token refreshed successfully!' };
  }

  async logout(dto: LogoutDto) {
    const { access_token, refresh_token } = dto;
    console.log(access_token, refresh_token,'herrrrrrrrrrrrrrrr');
    const at = await this.redisService.getClient().get(access_token);
    if (!at) throw new UnauthorizedException('Invalid access token!');
    const decoded = this.jwtService.verify(access_token, { secret: process.env.JWT_ACCESS_SECRET });
    if (!decoded) throw new UnauthorizedException('Invalid access token!');
 
    await this.redisService.getClient().del(access_token);
    await this.redisService.getClient().del(refresh_token);
    return { message: 'Logout successful!' };
  }

  private async generateOtp(userId: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redisService
      .getClient()
      .set(`${userId}`, otp, 'EX', 5 * 60, (err) => {
        if (err) {
          console.error('Error setting otp in Redis:', err);
        }
      });
    return otp;
  }

  private async getTokens(userId: string, email: string, otpVerified: boolean) {
    const payload = { sub: userId, email, otpVerified };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '50m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '1d',
      }),
    ]);
    await this.redisService
      .getClient()
      .set(at, userId, 'EX', 50 * 60, (err) => {
        if (err) {
          console.error('Error setting access token in Redis:', err);
        }
      });
    await this.redisService
      .getClient()
      .set(rt, userId, 'EX', 60 * 60 * 24, (err) => {
        if (err) {
          console.error('Error setting refresh token in Redis:', err);
        }
      });
    return { access_token: at, refresh_token: rt };
  }
}
