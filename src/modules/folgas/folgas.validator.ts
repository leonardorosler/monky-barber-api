import { z } from 'zod'

export const schemaCriarFolga = z.object({
  data: z.coerce.date({ invalid_type_error: 'Data inválida.' }),
  motivo: z.string().optional(),
})

export type CriarFolgaDTO = z.infer<typeof schemaCriarFolga>
