import { IsEmail, IsInt, IsString, Matches, Max, MaxLength, Min, MinLength } from "class-validator";

export class CreateUserDto {


    @MinLength(1)
    name: string

    @IsString()
    @IsEmail()
    email: string

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    // Patron para que se cumpla una serie de restricciones al crear la contraseña
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Debe tener mayúscula, minúscula y número o símbolo'
    })
    password: string

    @IsInt()
    @Min(1)
    @Max(12, {
        message: 'No puedes darle mas de 12 horas de estudio'
    })
    availableHoursPerDay: number

}
