import { z } from 'zod'
import { parseBusinessDateOnly } from '../../shared/utils/date.utils'

const schemaDataLocal = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Data invalida. Use o formato YYYY-MM-DD.',
  })
  .transform((value) => parseBusinessDateOnly(value))

export const schemaCriarFolga = z.object({
  data: schemaDataLocal,
  motivo: z.string().optional(),
})

export type CriarFolgaDTO = z.infer<typeof schemaCriarFolga>
