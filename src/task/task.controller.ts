import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(@Body() createTaskDto: CreateTaskDto,
    @GetUser() user: User
  ) {
    return this.taskService.create(createTaskDto, user);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(@GetUser('id') userId: number) {
    return this.taskService.findAllByUser(userId);
  }

  @Get(':term')
  @UseGuards(AuthGuard())
  findOne(
    @Param('term') term: string,
    @GetUser('id') userId: number
  ) {
    return this.taskService.findOnePlain(term, userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser('id') userId: number
  ) {
    return this.taskService.update(id, updateTaskDto, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number
  ) {
    return this.taskService.remove(id, userId);
  }
}
