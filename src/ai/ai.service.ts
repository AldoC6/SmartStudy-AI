import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {

    private ai

    constructor(
        private readonly configService: ConfigService
    ) {

        this.ai = new GoogleGenAI({
            apiKey: this.configService.get<string>('GEMINI_API_KEY')
        })
    }

    async generateStudyPlan(tasks: any[], userContext: any) {

        const cleanTasks = tasks.map(task => ({
            title: task.title,
            difficulty: task.difficulty,
            deadline: task.deadline,
            estimatedTime: task.estimatedTime
        }));

        try {
            const prompt = this.buildPrompt(cleanTasks, userContext)

            const response = await this.ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt
            });

            const text = response.text;

            return this.parseJSON(text)

        } catch (error) {

            console.log(error)

            return {
                error: true,
                message: "No se pudo generar plan",
                fallback: true
            };

        }

    }

    private buildPrompt(tasks: any[], userContext): string {
        console.log(tasks, userContext)
        return `
        Eres un asistente experto en planificación academica.

        El usuario tiene:
        - ${userContext.availableHoursPerDay} horas disponibles por día
        Tareas:
        ${JSON.stringify(tasks, null, 2)}
        Genera un plan de estudio optimizado.
        Reglas:
        - No exceder las horas disponibles por día
        - Priorizar por deadline
        - Considerar dificultad
        - Distribuir la carga de forma equilibrada
        RESPONDE SOLO EN JSON.
        Formato:
        {
            "plan": [
                {
                "day": "Lunes",
                "hours_used": 5,
                "tasks": ["..."]
                }
            ]
        }
        `;

    }

    private parseJSON(text: string) {
        try {
            const clean = text.replace(/```json|```/g, '').trim();
            return JSON.parse(clean);
        } catch (error) {
            console.log(error)
            return {
                error: "Error parseando JSON",
                raw: text
            };
        }
    }

}
