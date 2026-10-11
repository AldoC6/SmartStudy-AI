import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {

    private ai

    // Sin "thinking" la respuesta tarda unos pocos segundos en vez de 20-40 s
    private readonly generationConfig = {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 0 }
    };

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
                contents: prompt,
                config: this.generationConfig
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


    async generatePlanWithPython(response_py: any[], userContext: any, tasks: any[]) {

        const cleanTasks = tasks.map(task => ({
            title: task.title,
            difficulty: task.difficulty,
            deadline: task.deadline,
            estimatedTime: task.estimatedTime
        }));

        try {

            const prompt = this.buildPromptWithPython(cleanTasks, userContext, response_py)

            const response = await this.ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: this.generationConfig
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


    // Metodo para usar con red neuronal
    private buildPromptWithPython(tasks: any[], userContext, response_py: any[]): string {
        console.log(tasks, userContext, response_py)
        return `
            Eres un asistente experto en planificación académica.

            Tu tarea es generar un plan de estudio semanal claro, organizado y realista.

            IMPORTANTE:

            * NO recalcules prioridades ni tiempos.
            * Usa EXACTAMENTE los valores proporcionados por el sistema inteligente.
            * Usa las horas_recomendadas como base para distribuir el tiempo.
            * Solo organiza y presenta la información.

            El usuario tiene:

            * ${userContext.availableHoursPerDay} horas disponibles por día

            Tareas originales:
            ${JSON.stringify(tasks, null, 2)}

            Resultados del sistema inteligente (IA):
            ${JSON.stringify(response_py, null, 2)}

            INSTRUCCIONES:

            1. Relaciona cada tarea con su resultado usando "taskId".

            2. Interpreta:

            * prioridad: 0 = baja, 1 = media, 2 = alta
            * horas_recomendadas: horas sugeridas por día

            3. PLANIFICACIÓN:

            * Prioriza tareas con prioridad 2, luego 1, luego 0.
            * Usa las horas_recomendadas como guía principal de tiempo.
            * No excedas las horas disponibles por día.
            * Intenta aprovechar el tiempo disponible sin sobrecargar.

            4. DISTRIBUCIÓN:

            * Si una tarea es pequeña (≤ 2 horas), complétala en uno o pocos días.
            * Si es grande, divídela en varios días equilibradamente.
            * Si el deadline es cercano (≤ 2 días), colócala al inicio del plan.
            * Evita dejar días vacíos si hay tareas pendientes.
            * Evita repetir innecesariamente la misma tarea.
            * La suma total del tiempo asignado a cada tarea NO debe exceder su tiempo estimado total.

            5. CALIDAD DEL PLAN:

            * No sobrecargues un solo día.
            * Usa tiempos realistas.
            * Convierte horas menores a 1 en minutos.
            * Evita tiempos demasiado pequeños; agrúpalos en bloques prácticos.
            * Una vez que una tarea ha sido completada según su tiempo total estimado, NO debe seguir apareciendo en días posteriores.

            RESPONDE SOLO EN JSON.

            Formato:
            {
                "plan": [
                    {
                        "day": "Lunes",
                        "hours_used": number,
                        "tasks": [
                            "string"
                        ]
                    }
                ]
            }
        `;

    }


    // Metodo para usar sin red neuronal
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
