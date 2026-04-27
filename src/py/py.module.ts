import { Module } from '@nestjs/common';
import { PyService } from './py.service';

@Module({
  providers: [PyService],
  exports: [PyService]
})
export class PyModule { }
