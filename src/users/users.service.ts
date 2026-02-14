import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ValidationError,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(data: any) {
    console.log('data ', data);
    try {
      const newUser = new this.userModel(data);
      const savedUser = await newUser.save();

      const user = savedUser.toObject();

      return {
        message: 'User registered successfully',
        data: user,
      };
    } catch (error) {
      console.log('error', error.name, error.message);
      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message);
      } else if (error.code === 11000) {
        throw new ConflictException('Email already exists.');
      } else if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(error.message);
    }
  }
  //this is for internal only
  async findUserByEmail(email: string, showPassword = false) {
    try {
      let query = this.userModel.findOne({ email, isDeleted: false });
      if (showPassword) {
        query = query.select('+password');
      }

      const user = await query.exec();

      return user;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred while finding user.',
      );
    }
  }
  async findUserByID(id: string) {
    try {
      const user = await this.userModel
        .findOne({
          _id: id,
        })
        .exec();
      if (!user) {
        throw new NotFoundException('User not found.');
      }
      return {
        message: 'User found successfully',
        data: user,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while finding user.',
      );
    }
  }

  async updateUser(id: string, data: any) {
    try {
      const user = await this.userModel
        .findByIdAndUpdate(id, data, { after: true })
        .exec();
      if (!user) {
        throw new NotFoundException('User not found.');
      }
      return {
        message: 'User updated successfully',
        data: user,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while updating user.',
      );
    }
  }

  async deleteUser(id: string) {
    try {
      const user = await this.userModel
        .findByIdAndUpdate(
          { _id: id, isDeleted: false },
          { isDeleted: true, deletedAt: new Date() },
          { after: true },
        )
        .exec();
      if (!user) {
        throw new NotFoundException('User not found.');
      }
      return {
        message: 'User deleted successfully',
        data: user,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while deleting user.',
      );
    }
  }
}
