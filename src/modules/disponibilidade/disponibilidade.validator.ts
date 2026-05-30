import { z } from 'zod'

export const schemaDisponibilidade = z.object({
  diaSemana: z
    .number()
    .int()
    .min(0, 'Dia inválido.')
    .max(6, 'Dia inválido.'), // 0 = domingo, 6 = sábado
  horaInicio: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora inválida. Use o formato HH:MM.'),
  horaFim: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora inválida. Use o formato HH:MM.'),
}).refine((d) => d.horaInicio < d.horaFim, {
  message: 'Hora de início deve ser anterior à hora de fim.',
  path: ['horaInicio'],
})

export const schemaDefinirDisponibilidades = z.object({
  disponibilidades: z.array(schemaDisponibilidade),
})

export type DisponibilidadeDTO = z.infer<typeof schemaDisponibilidade>
export type DefinirDisponibilidadesDTO = z.infer<typeof schemaDefinirDisponibilidades>
