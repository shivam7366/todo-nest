import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Query,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @Post('register')
  async register(@Body() data: any) {
    return await this.userService.create(data);
  }
  @Get('get-user/:id')
  async getUser(@Param('id') id: string) {
    return await this.userService.findUserByID(id);
  }
  @Patch('update-user/:id')
  async updateUser(@Param('id') id: string, @Body() data: any) {
    return await this.userService.updateUser(id, data);
  }
  @Delete('delete-user/:id')
  async deleteUser(@Param('id') id: string) {
    return await this.userService.deleteUser(id);
  }
}
