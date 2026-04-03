import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [AiService],
  imports: [
    ConfigModule
  ],

  exports: [AiService]
})
export class AiModule { }
