import { z } from 'zod'

export const schemaCriarBloqueio = z.object({
  inicio: z.coerce.date({ error: 'Data/hora de início inválida.' }),
  fim: z.coerce.date({ error: 'Data/hora de fim inválida.' }),
  motivo: z.string().optional(),
}).refine((d) => d.fim > d.inicio, {
  message: 'O fim deve ser posterior ao início.',
  path: ['fim'],
})

export type CriarBloqueioDTO = z.infer<typeof schemaCriarBloqueio>
