import { z } from 'zod'
import { parseBusinessDateOnly, parseBusinessDateTime } from '../../shared/utils/date.utils'

const schemaDataLocal = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Data invalida. Use o formato YYYY-MM-DD.',
  })
  .transform((value) => parseBusinessDateOnly(value))

const schemaDataHoraLocal = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?$/, {
    message: 'Data/hora invalida. Use o formato YYYY-MM-DDTHH:mm:ss sem timezone.',
  })
  .transform((value) => parseBusinessDateTime(value))

export const schemaCriarAgendamento = z.object({
  barbeiroId: z.string().min(1, 'Barbeiro obrigatorio.'),
  servicoId: z.string().min(1, 'Servico obrigatorio.'),
  inicio: schemaDataHoraLocal,
})

export const schemaAtualizarStatus = z.object({
  status: z.enum(['CONFIRMADO', 'CONCLUIDO', 'CANCELADO', 'NAO_COMPARECEU'], {
    error: 'Status invalido.',
  }),
})

export const schemaHorariosDisponiveis = z.object({
  barbeiroId: z.string().min(1, 'Barbeiro obrigatorio.'),
  servicoId: z.string().min(1, 'Servico obrigatorio.'),
  data: schemaDataLocal,
})

export type CriarAgendamentoDTO = z.infer<typeof schemaCriarAgendamento>
export type AtualizarStatusDTO = z.infer<typeof schemaAtualizarStatus>
export type HorariosDisponiveisDTO = z.infer<typeof schemaHorariosDisponiveis>
