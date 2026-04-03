import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class TaskService {

  private readonly logger = new Logger('ProductsService')

  constructor(

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

  ) { }


  async create(createTaskDto: CreateTaskDto, user: User) {

    try {

      const { ...taskDetails } = createTaskDto

      const task = this.taskRepository.create({
        ...taskDetails,
        user
      })

      await this.taskRepository.save(task)

      return task

    } catch (error) {

      this.handleDBExcpetions(error)

    }

  }

  async findAllByUser(userId: number) {

    const allTask = await this.taskRepository.find({
      where: { user: { id: userId } }
    })

    return allTask;
  }

  async findOne(term: string, userId: number) {

    let task: Task

    if (Number(term)) {
      task = await this.taskRepository.findOne({
        where: {
          id: Number(term),
          user: { id: userId }
        }

      })
    } else {

      const queryBuilder = this.taskRepository.createQueryBuilder('tasks');
      task = await queryBuilder
        .where(`UPPER(title) LIKE :title`, {
          title: `%${term.toUpperCase()}%`
        })
        .andWhere('tasks.userId = :userId', { userId })
        .getOne()
    }

    if (!task)
      throw new NotFoundException(`Task no fue encontrado (${term})`)


    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number) {

    await this.findOne(id.toString(), userId);

    const task = await this.taskRepository.preload({
      id,
      ...updateTaskDto,
    });

    if (!task)
      throw new NotFoundException(`Task con id ${id} no fue encontrado`);

    task.user = { id: userId } as User;

    await this.taskRepository.save(task);

    return this.findOnePlain(id.toString(), userId);
  }

  async remove(id: number, userId: number) {

    const task = await this.findOne(id.toString(), userId)

    await this.taskRepository.remove(task)

    return `La Task fue removida`;
  }


  async findOnePlain(term: string, userId) {


    const { ...rest } = await this.findOne(term, userId);

    return {
      ...rest,
    }
  }


  private handleDBExcpetions(error: any) {

    // 23505 es el error de violacion de constraint unico en postgres
    if (error.code === '23505') {
      throw new BadRequestException(error.detail)
    }

    this.logger.error(error);
    // console.log(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }


}
