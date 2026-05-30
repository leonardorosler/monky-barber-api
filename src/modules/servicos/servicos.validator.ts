import { z } from 'zod'

export const schemaCriarServico = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  descricao: z.string().optional(),
  duracao: z
    .number({ invalid_type_error: 'Duração deve ser um número.' })
    .int('Duração deve ser um número inteiro.')
    .min(5, 'Duração mínima de 5 minutos.'),
  preco: z
    .number({ invalid_type_error: 'Preço deve ser um número.' })
    .min(0, 'Preço não pode ser negativo.'),
})

export const schemaAtualizarServico = z.object({
  nome: z.string().min(2).optional(),
  descricao: z.string().optional(),
  duracao: z.number().int().min(5).optional(),
  preco: z.number().min(0).optional(),
  ativo: z.boolean().optional(),
})

export type CriarServicoDTO = z.infer<typeof schemaCriarServico>
export type AtualizarServicoDTO = z.infer<typeof schemaAtualizarServico>
