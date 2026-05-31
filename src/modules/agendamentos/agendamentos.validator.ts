import { z } from 'zod'

export const schemaCriarAgendamento = z.object({
  barbeiroId: z.string().min(1, 'Barbeiro obrigatório.'),
  servicoId: z.string().min(1, 'Serviço obrigatório.'),
  inicio: z.coerce.date({ error: 'Data/hora inválida.' }),
})

export const schemaAtualizarStatus = z.object({
  status: z.enum(['CONFIRMADO', 'CONCLUIDO', 'CANCELADO', 'NAO_COMPARECEU'], {
    error: 'Status inválido.',
  }),
})

export const schemaHorariosDisponiveis = z.object({
  barbeiroId: z.string().min(1, 'Barbeiro obrigatório.'),
  servicoId: z.string().min(1, 'Serviço obrigatório.'),
  data: z.coerce.date({ error: 'Data inválida.' }),
})

export type CriarAgendamentoDTO = z.infer<typeof schemaCriarAgendamento>
export type AtualizarStatusDTO = z.infer<typeof schemaAtualizarStatus>
export type HorariosDisponiveisDTO = z.infer<typeof schemaHorariosDisponiveis>
