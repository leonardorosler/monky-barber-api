import { z } from 'zod'

export const schemaCriarBarbeiro = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('E-mail inválido.'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres.'),
  foto: z.string().url('URL inválida.').optional(),
  bio: z.string().optional(),
})

export const schemaAtualizarBarbeiro = z.object({
  nome: z.string().min(2).optional(),
  foto: z.string().url('URL inválida.').optional(),
  bio: z.string().optional(),
  ativo: z.boolean().optional(),
})

export type CriarBarbeiroDTO = z.infer<typeof schemaCriarBarbeiro>
export type AtualizarBarbeiroDTO = z.infer<typeof schemaAtualizarBarbeiro>
