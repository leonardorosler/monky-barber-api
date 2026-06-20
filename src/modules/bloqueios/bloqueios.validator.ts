import { z } from 'zod'
import { parseBusinessDateTime } from '../../shared/utils/date.utils'

const schemaDataHoraLocal = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?$/, {
    message: 'Data/hora invalida. Use o formato YYYY-MM-DDTHH:mm:ss sem timezone.',
  })
  .transform((value) => parseBusinessDateTime(value))

export const schemaCriarBloqueio = z
  .object({
    inicio: schemaDataHoraLocal,
    fim: schemaDataHoraLocal,
    motivo: z.string().optional(),
  })
  .refine((d) => d.fim > d.inicio, {
    message: 'O fim deve ser posterior ao inicio.',
    path: ['fim'],
  })

export type CriarBloqueioDTO = z.infer<typeof schemaCriarBloqueio>
