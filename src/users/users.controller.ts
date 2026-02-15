import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Query,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  // @Post('register')
  // async register(@Body() data: any) {
  //   return await this.userService.create(data);
  // }
  @Get('get-user-details')
  async getUser(@Req() req: any) {
    return await this.userService.findUserByID(req.user.userId);
  }
  @Patch('update-user/:id')
  async updateUser(@Param('id') id: string, @Body() data: any) {
    return await this.userService.updateUser(id, data);
  }
  @Patch('delete-user/:id')
  async deleteUser(@Param('id') id: string) {
    return await this.userService.deleteUser(id);
  }
}
