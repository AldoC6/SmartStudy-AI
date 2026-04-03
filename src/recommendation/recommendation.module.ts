import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recommendation } from './entities/recommendation.entity';
import { AuthModule } from 'src/auth/auth.module';
import { TaskModule } from 'src/task/task.module';
import { AiModule } from 'src/ai/ai.module';

@Module({
  controllers: [RecommendationController],
  providers: [RecommendationService],
  imports: [
    TypeOrmModule.forFeature([Recommendation]),
    AuthModule,
    TaskModule,
    AiModule
  ]
})
export class RecommendationModule { }
