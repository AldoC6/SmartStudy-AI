import { User } from "src/auth/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


export enum TaskStatus {
    PENDING = 'Pendiente',
    DONE = 'Terminado',
}

@Entity('tasks')
export class Task {

    @PrimaryGeneratedColumn({
        name: 'id_task'
    })
    id: number

    @Column('varchar')
    title: string

    @Column('text', {
        nullable: true
    })
    description?: string

    @Column('int')
    difficulty: number

    @Column('int', {
        name: 'estimated_time'
    })
    estimatedTime: number

    @Column('timestamptz')
    deadline: Date

    @Column('enum', {
        enum: TaskStatus,
        default: TaskStatus.PENDING
    })
    status: TaskStatus


    // Relacion Muchos a UNO
    @ManyToOne(
        () => User,
        (user) => user.task
    )
    user: User


    @Column('timestamptz', {
        name: 'created_at',
        default: () => 'CURRENT_TIMESTAMP'
    })
    createdAt: Date

}
