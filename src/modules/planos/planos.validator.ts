import { z } from 'zod'

export const schemaPlanoServico = z.object({
  servicoId: z.string().min(1, 'Serviço obrigatório.'),
  quantidade: z.number().int().min(1, 'Quantidade mínima é 1.'),
})

export const schemaCriarPlano = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  descricao: z.string().optional(),
  preco: z.number().min(0, 'Preço não pode ser negativo.'),
  servicos: z.array(schemaPlanoServico).min(1, 'O plano deve ter pelo menos um serviço.'),
})

export const schemaAtualizarPlano = z.object({
  nome: z.string().min(2).optional(),
  descricao: z.string().optional(),
  preco: z.number().min(0).optional(),
  ativo: z.boolean().optional(),
  servicos: z.array(schemaPlanoServico).min(1).optional(),
})

export type CriarPlanoDTO = z.infer<typeof schemaCriarPlano>
export type AtualizarPlanoDTO = z.infer<typeof schemaAtualizarPlano>
