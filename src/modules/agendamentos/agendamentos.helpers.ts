import { disponibilidadeRepository } from '../disponibilidade/disponibilidade.repository'
import { folgasRepository } from '../folgas/folgas.repository'
import { bloqueiosRepository } from '../bloqueios/bloqueios.repository'
import { agendamentosRepository } from './agendamentos.repository'
import { ErroAplicacao } from '../../shared/middlewares/error.middleware'

// converte "08:30" em minutos (510)
function horaParaMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

// converte Date em minutos do dia
function dateParaMinutos(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

export async function validarHorarioAgendamento(
  barbeiroId: string,
  inicio: Date,
  fim: Date,
  ignorarAgendamentoId?: string
): Promise<void> {
  const diaSemana = inicio.getDay() // 0 = domingo

  // 1. verifica disponibilidade no dia da semana
  const disponibilidades = await disponibilidadeRepository.listarPorBarbeiro(barbeiroId)
  const disponibilidade = disponibilidades.find((d) => d.diaSemana === diaSemana)

  if (!disponibilidade) {
    throw new ErroAplicacao('O barbeiro não trabalha neste dia da semana.', 409)
  }

  const inicioMinutos = dateParaMinutos(inicio)
  const fimMinutos = dateParaMinutos(fim)
  const expedienteInicio = horaParaMinutos(disponibilidade.horaInicio)
  const expedienteFim = horaParaMinutos(disponibilidade.horaFim)

  if (inicioMinutos < expedienteInicio || fimMinutos > expedienteFim) {
    throw new ErroAplicacao(
      `O barbeiro atende das ${disponibilidade.horaInicio} às ${disponibilidade.horaFim}.`,
      409
    )
  }

  // 2. verifica folga no dia
  const temFolga = await folgasRepository.existeNaData(barbeiroId, inicio)

  if (temFolga) {
    throw new ErroAplicacao('O barbeiro está de folga neste dia.', 409)
  }

  // 3. verifica bloqueio de horário
  const temBloqueio = await bloqueiosRepository.existeConflito(barbeiroId, inicio, fim)

  if (temBloqueio) {
    throw new ErroAplicacao('Este horário está bloqueado pelo barbeiro.', 409)
  }

  // 4. verifica conflito com outro agendamento
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
  const diaSemana = data.getDay()

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
    const inicioSlot = new Date(data)
    inicioSlot.setHours(Math.floor(cursor / 60), cursor % 60, 0, 0)

    const fimSlot = new Date(inicioSlot)
    fimSlot.setMinutes(fimSlot.getMinutes() + duracaoMinutos)

    // verifica conflito com agendamentos existentes
    const conflitaAgendamento = agendamentosNoDia.some(
      (a) => a.inicio < fimSlot && a.fim > inicioSlot
    )

    // verifica conflito com bloqueios
    const conflitaBloqueio = bloqueios.some(
      (b) => b.inicio < fimSlot && b.fim > inicioSlot
    )

    // não oferece horários no passado
    const noPassado = inicioSlot < new Date()

    if (!conflitaAgendamento && !conflitaBloqueio && !noPassado) {
      const hh = String(Math.floor(cursor / 60)).padStart(2, '0')
      const mm = String(cursor % 60).padStart(2, '0')
      horarios.push(`${hh}:${mm}`)
    }

    cursor += 30 // incremento de 30 em 30 minutos
  }

  return horarios
}
