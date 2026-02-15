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
  ResendOtpDto,
  SignupDto,
  VerifyOtpDto,
} from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import passport from 'passport';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private mailService: MailService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const user = await this.userService.findUserByEmail(dto.email);
    if (user) throw new ConflictException('User already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    const newUser = await this.userService.create({
      ...dto,
      password: hashedPassword,
      otp,
      otpExpiry,
    });
    const tokens = await this.getTokens(
      newUser?.data?._id?.toString(),
      dto.email,
      false,
    );
    await this.mailService.sendOtpMail(dto.email, otp, dto.firstName);

    return {
      message: 'Signup successful. Please check your email for OTP.',
      ...tokens,
    };
  }

  async resendOtp(dto: ResendOtpDto) {
    const user = await this.userService.findUserByEmail(dto.email);
    if (!user) throw new NotFoundException('User not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await this.userService.updateUser(user._id.toString(), {
      otp: otp,
      otpExpiry: otpExpiry,
    });
    await this.mailService.sendOtpMail(dto.email, otp, user.firstName);
    return {
      message: 'OTP sent. Please check your email for OTP.',
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.userService.findUserByEmail(dto.email);
    if (!user) throw new NotFoundException('User not found');
    if (user.otp != dto.otp || new Date() > user.otpExpiry) {
      throw new BadRequestException('Invalid or Expired OTP!');
    }
    const updatedUser = await this.userService.updateUser(user._id.toString(), {
      otpVerified: true,
      otp: null,
      otpExpiry: null,
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

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
