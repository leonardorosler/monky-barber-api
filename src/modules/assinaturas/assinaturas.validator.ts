import { z } from 'zod'

export const schemaCriarAssinatura = z.object({
  planoId: z.string().min(1, 'Plano obrigatório.'),
})

export const schemaAtualizarStatusAssinatura = z.object({
  status: z.enum(['ATIVA', 'CANCELADA', 'EXPIRADA', 'INADIMPLENTE'], {
    errorMap: () => ({ message: 'Status inválido.' }),
  }),
})

export type CriarAssinaturaDTO = z.infer<typeof schemaCriarAssinatura>
export type AtualizarStatusAssinaturaDTO = z.infer<typeof schemaAtualizarStatusAssinatura>
