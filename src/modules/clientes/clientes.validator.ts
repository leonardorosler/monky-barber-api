import { z } from 'zod'

export const schemaAtualizarCliente = z.object({
  nome: z.string().min(2).optional(),
  telefone: z.string().optional(),
})

export type AtualizarClienteDTO = z.infer<typeof schemaAtualizarCliente>
