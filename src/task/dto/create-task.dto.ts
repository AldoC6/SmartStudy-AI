import { Type } from "class-transformer"
import { IsDate, IsInt, IsOptional, IsPositive, IsString, Max, MaxLength, Min, MinDate, MinLength } from "class-validator"


export class CreateTaskDto {


    @IsString()
    @MinLength(1)
    @MaxLength(255)
    title: string

    @IsString()
    @IsOptional()
    @MinLength(1)
    @MaxLength(255)
    description?: string


    @Type(() => Number)
    @IsInt()
    @IsPositive()
    @Max(10)
    @Min(1)
    difficulty: number


    @IsInt()
    @IsPositive()
    @Min(1)
    estimatedTime: number

    @Type(() => Date)
    @IsDate()
    @MinDate(new Date())
    deadline: Date

}
