import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';

@Controller('recommendation')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) { }

  @Post()
  @UseGuards(AuthGuard())
  create(
    @GetUser() user: User
  ) {
    return this.recommendationService.create(user);
  }

  @Post('py')
  @UseGuards(AuthGuard())
  createPyRecommendation(
    @GetUser() user: User
  ) {
    return this.recommendationService.createPyRecommendation(user);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAllByUser(
    @GetUser('id') userId: number
  ) {
    return this.recommendationService.findAllByUser(userId);
  }

}
