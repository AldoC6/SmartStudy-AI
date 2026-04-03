
import { User } from "src/auth/entities/user.entity";
import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from "typeorm";

@Entity('recommendations')
export class Recommendation {

    @PrimaryGeneratedColumn()
    id_recommendation: number;

    @ManyToOne(
        () => User,
        (user) => user.recommendations,
        { eager: true }
    )
    user: User;

    @Column({ type: 'jsonb' })
    generated_plan: any;

    @CreateDateColumn()
    created_at: Date;
}