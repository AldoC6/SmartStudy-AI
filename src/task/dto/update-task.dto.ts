import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {

    // Extendemos manualmente ya que status no existen el
    // DTO, en sistemas mas complejos considerar enpoint para
    // cambiar el estatus
    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

}
