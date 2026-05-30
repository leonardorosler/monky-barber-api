import { z } from 'zod'

export const schemaCriarBarbearia = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  slug: z
    .string()
    .min(2, 'Slug deve ter pelo menos 2 caracteres.')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens.'),
  telefone: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  endereco: z.string().optional(),
})

export const schemaAtualizarBarbearia = z.object({
  nome: z.string().min(2).optional(),
  logo: z.string().url('URL inválida.').optional(),
  banner: z.string().url('URL inválida.').optional(),
  telefone: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  endereco: z.string().optional(),
  horarioFuncionamento: z.record(
    z.enum(['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']),
    z.union([
      z.object({
        abre: z.string(),
        fecha: z.string(),
      }),
      z.null(),
    ])
  ).optional(),
})

export type CriarBarbeariaDTO = z.infer<typeof schemaCriarBarbearia>
export type AtualizarBarbeariaDTO = z.infer<typeof schemaAtualizarBarbearia>
