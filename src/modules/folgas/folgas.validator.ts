import { z } from 'zod'

export const schemaCriarFolga = z.object({
  data: z.coerce.date({ error: 'Data inválida.' }),
  motivo: z.string().optional(),
})

export type CriarFolgaDTO = z.infer<typeof schemaCriarFolga>
