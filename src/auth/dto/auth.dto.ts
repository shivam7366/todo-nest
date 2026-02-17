import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'hello@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password@123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '2000/01/01' })
  @IsDateString()
  dateOfBirth: string;
}

export class ResendOtpDto {
  @ApiProperty({ example: 'hello@example.com' })
  @IsEmail()
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'hello@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class LoginDto {
  @ApiProperty({ example: 'hello@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password@123' })
  @IsNotEmpty()
  password: string;
}

export class LogoutDto {
  @ApiProperty({ example: 'access_token_value' })
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @ApiProperty({ example: 'refresh_token_value' })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'refresh_token_value' })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}