import { Injectable } from '@nestjs/common';
import axios from 'axios';


@Injectable()
export class PyService {

    async evaluateTasks(tasks: any[], availableHours: number) {
        try {
            // Las predicciones son independientes: se lanzan en paralelo
            const results = await Promise.all(tasks.map(async (task) => {
                const payload = {
                    horas: availableHours,
                    dificultad: task.difficulty,
                    estimated_time: task.estimatedTime / 60, // Convertir a horas
                    dias_restantes: this.calcularDias(task.deadline),
                    tasks: tasks.length
                };

                const res = await axios.post('http://127.0.0.1:8000/predictRN', payload, { timeout: 15000 });

                return {
                    taskId: task.id,
                    ...res.data
                };
            }));


            console.log('Resultados de Python:', results);

            return results;

        } catch (error) {
            console.error('Error al comunicarse con el servicio de Python:', error);
            throw new Error('Error al comunicarse con el servicio de Python');
        }
    }

    private calcularDias(deadline: Date): number {
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 0 ? diffDays : 0;
    }

}
