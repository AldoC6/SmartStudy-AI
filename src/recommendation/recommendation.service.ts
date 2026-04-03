import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation } from './entities/recommendation.entity';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/auth/entities/user.entity';
import { TaskService } from 'src/task/task.service';

@Injectable()
export class RecommendationService {

  constructor(

    @InjectRepository(Recommendation)
    private readonly recommendationRepository: Repository<Recommendation>,

    private readonly taskService: TaskService

  ) { }

  async create(user: User) {

    try {

      const tasks = await this.taskService.findAllPendingByUser(user.id);

      const fakePlan = {
        message: "Plan generado basado en tus tareas",
        totalTask: tasks.length,
        task: tasks.map(task => ({
          title: task.title,
          deadline: task.deadline,
          difficulty: task.difficulty
        }))
      }

      const recommendation = this.recommendationRepository.create({
        user,
        generated_plan: fakePlan
      })

      await this.recommendationRepository.save(recommendation);

      return recommendation

    } catch (error) {

      console.log(error)
      throw new InternalServerErrorException(`Error generando la recomendación`, error)
    }

  }

  async findAllByUser(userId: number) {

    const allRecomendations = await this.recommendationRepository.find({
      where: {
        user: { id: userId }
      }
    })

    return allRecomendations;
  }

  findOne(id: number) {
    return `This action returns a #${id} recommendation`;
  }

  update(id: number, updateRecommendationDto: UpdateRecommendationDto) {
    return `This action updates a #${id} recommendation`;
  }

  remove(id: number) {
    return `This action removes a #${id} recommendation`;
  }
}
