import { disponibilidadeRepository } from '../disponibilidade/disponibilidade.repository'
import { folgasRepository } from '../folgas/folgas.repository'
import { bloqueiosRepository } from '../bloqueios/bloqueios.repository'
import { agendamentosRepository } from './agendamentos.repository'
import { ErroAplicacao } from '../../shared/middlewares/error.middleware'
import {
  businessMinutes,
  businessWeekday,
  dateAtBusinessMinutes,
} from '../../shared/utils/date.utils'

function horaParaMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

export async function validarHorarioAgendamento(
  barbeiroId: string,
  inicio: Date,
  fim: Date,
  ignorarAgendamentoId?: string
): Promise<void> {
  const diaSemana = businessWeekday(inicio)

  const disponibilidades = await disponibilidadeRepository.listarPorBarbeiro(barbeiroId)
  const disponibilidade = disponibilidades.find((d) => d.diaSemana === diaSemana)

  if (!disponibilidade) {
    throw new ErroAplicacao('O barbeiro não trabalha neste dia da semana.', 409)
  }

  const inicioMinutos = businessMinutes(inicio)
  const fimMinutos = businessMinutes(fim)
  const expedienteInicio = horaParaMinutos(disponibilidade.horaInicio)
  const expedienteFim = horaParaMinutos(disponibilidade.horaFim)

  if (inicioMinutos < expedienteInicio || fimMinutos > expedienteFim) {
    throw new ErroAplicacao(
      `O barbeiro atende das ${disponibilidade.horaInicio} às ${disponibilidade.horaFim}.`,
      409
    )
  }

  const temFolga = await folgasRepository.existeNaData(barbeiroId, inicio)

  if (temFolga) {
    throw new ErroAplicacao('O barbeiro está de folga neste dia.', 409)
  }

  const temBloqueio = await bloqueiosRepository.existeConflito(barbeiroId, inicio, fim)

  if (temBloqueio) {
    throw new ErroAplicacao('Este horário está bloqueado pelo barbeiro.', 409)
  }

  const temConflito = await agendamentosRepository.existeConflito(
    barbeiroId,
    inicio,
    fim,
    ignorarAgendamentoId
  )

  if (temConflito) {
    throw new ErroAplicacao('Este horário já está ocupado.', 409)
  }
}

export async function gerarHorariosDisponiveis(
  barbeiroId: string,
  data: Date,
  duracaoMinutos: number
): Promise<string[]> {
  const diaSemana = businessWeekday(data)

  const disponibilidades = await disponibilidadeRepository.listarPorBarbeiro(barbeiroId)
  const disponibilidade = disponibilidades.find((d) => d.diaSemana === diaSemana)

  if (!disponibilidade) return []

  const temFolga = await folgasRepository.existeNaData(barbeiroId, data)
  if (temFolga) return []

  const agendamentosNoDia = await agendamentosRepository.listarPorBarbeiro(barbeiroId, data)
  const bloqueios = await bloqueiosRepository.listar(barbeiroId)

  const expedienteInicio = horaParaMinutos(disponibilidade.horaInicio)
  const expedienteFim = horaParaMinutos(disponibilidade.horaFim)

  const horarios: string[] = []
  let cursor = expedienteInicio

  while (cursor + duracaoMinutos <= expedienteFim) {
    const inicioSlot = dateAtBusinessMinutes(data, cursor)
    const fimSlot = new Date(inicioSlot.getTime() + duracaoMinutos * 60_000)

    const conflitaAgendamento = agendamentosNoDia.some(
      (a) => a.inicio < fimSlot && a.fim > inicioSlot
    )

    const conflitaBloqueio = bloqueios.some(
      (b) => b.inicio < fimSlot && b.fim > inicioSlot
    )

    const noPassado = inicioSlot < new Date()

    if (!conflitaAgendamento && !conflitaBloqueio && !noPassado) {
      const hh = String(Math.floor(cursor / 60)).padStart(2, '0')
      const mm = String(cursor % 60).padStart(2, '0')
      horarios.push(`${hh}:${mm}`)
    }

    cursor += 30
  }

  return horarios
}
