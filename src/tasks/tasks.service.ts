import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task } from './schema/task.schema';
import { Model } from 'mongoose';
import { TaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async create(data: any, userId: any) {
    try {
      const task = await this.taskModel.create({
        userId: userId,
        ...data,
      });
      return { data: task, message: 'Task created successfully!' };
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message || 'Bad Request');
      }
      throw new InternalServerErrorException(
        error.message || 'Something went wrong while creating task!',
      );
    }
  }
  async getAllTasks(userId: string) {
    try {
      if (!userId)
        throw new BadRequestException(`${userId} is not a valid userId`);
      const tasks = await this.taskModel
        .find({ userId })
        .select('title deadline')
        .exec();
      return {
        message: `All tasks associated with userId ${userId}`,
        data: tasks,
      };
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message || 'Bad Request');
      }
      throw new InternalServerErrorException(
        error.message || 'Something went wrong while geting all tasks!',
      );
    }
  }
  async getTaskById(taskId: string, userId: string) {
    const task = await this.taskModel.findOne({ _id: taskId, userId }).exec();

    if (!task) {
      throw new NotFoundException(
        'Task not found or you do not have permission',
      );
    }
    return { message: 'Task found.', data: task };
  }

  async updateTask(taskId: string, userId: string, data) {
    const updatedTask = await this.taskModel
      .findOneAndUpdate(
        { _id: taskId, userId },
        { $set: data },
        { returnDocument: 'after' },
      )
      .exec();

    if (!updatedTask) {
      throw new NotFoundException(
        'Task not found or you do not have permission to update it',
      );
    }
    return { message: 'Task updated succesfully.', data: updatedTask };
  }

  async deleteTask(taskId: string, userId: string) {
    const result = await this.taskModel
      .deleteOne({ _id: taskId, userId })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(
        'Task not found or you do not have permission to delete it',
      );
    }
    return { message: 'Task deleted successfully' };
  }
}
