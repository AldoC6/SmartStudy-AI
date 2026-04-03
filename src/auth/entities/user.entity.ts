import { Task } from "src/task/entities/task.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn({
        name: 'id_user'
    })
    id: number

    @Column('varchar')
    name: string

    @Column('varchar', {
        unique: true
    })
    email: string

    @Column('text', {
        select: false
    })
    password: string

    @Column('int', {
        name: 'available_hours_per_day',
        default: 0
    })
    availableHoursPerDay: number

    @Column('timestamptz', {
        name: 'created_at',
        default: () => 'CURRENT_TIMESTAMP'
    })
    createdAt: Date



    // Relacion uno a muchos
    @OneToMany(
        () => Task,
        (task) => task.user
    )
    task: Task[]
} 
