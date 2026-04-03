import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation } from './entities/recommendation.entity';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/auth/entities/user.entity';
import { TaskService } from 'src/task/task.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class RecommendationService {

  constructor(

    @InjectRepository(Recommendation)
    private readonly recommendationRepository: Repository<Recommendation>,

    private readonly taskService: TaskService,

    private readonly aiService: AiService


  ) { }

  async create(user: User) {

    try {

      const tasks = await this.taskService.findAllPendingByUser(user.id);

      // Horas que tiene el usuario para estudiar
      const userContext = {
        availableHoursPerDay: user.availableHoursPerDay
      };

      // const fakePlan = {
      //   message: "Plan generado basado en tus tareas",
      //   totalTask: tasks.length,
      //   task: tasks.map(task => ({
      //     title: task.title,
      //     deadline: task.deadline,
      //     difficulty: task.difficulty
      //   }))
      // }

      const generated_plan = await this.aiService.generateStudyPlan(tasks, userContext)

      if (!generated_plan) {
        throw new Error('La IA no devolvió datos');
      }

      const recommendation = this.recommendationRepository.create({
        user,
        generated_plan: generated_plan
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
