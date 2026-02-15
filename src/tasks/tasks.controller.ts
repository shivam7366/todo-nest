import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskDto } from './dto/task.dto';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private taskService: TasksService) {}

  @Post()
  async createTask(@Body() dto: TaskDto, @Req() req: any) {
    return await this.taskService.create(dto, req.user.userId);
  }

  @Get()
  async getAllTasks(@Req() req: any) {
    return await this.taskService.getAllTasks(req.user.userId);
  }
  @Get('/:id')
  async getTaskById(@Param('id') id: string, @Req() req: any) {
    return await this.taskService.getTaskById(id, req.user.userId);
  }
  @Patch('/:id')
  async updateTaskById(@Param('id') id: string, @Req() req: any) {
    return await this.taskService.updateTask(id, req.user.userId, req.body);
  }

  @Delete('/:id')
  async deleteTaskById(@Param('id') id: string, @Req() req: any) {
    return await this.taskService.deleteTask(id, req.user.userId);
  }
}
