import prisma from '../../shared/lib/prisma'
import {
  businessDayRange,
  businessMinutes,
  businessMonthRange,
  businessWeekday,
} from '../../shared/utils/date.utils'

function horarioParaMinutos(horario: string) {
  const [horas = '0', minutos = '0'] = horario.split(':')
  return Number(horas) * 60 + Number(minutos)
}

function minutosSobrepostos(inicioA: number, fimA: number, inicioB: number, fimB: number) {
  return Math.max(0, Math.min(fimA, fimB) - Math.max(inicioA, inicioB))
}

export const dashboardRepository = {
  async agendamentosHoje(barbeariaId: string) {
    const { inicio, fim } = businessDayRange(new Date())

    return prisma.agendamento.count({
      where: {
        barbeariaId,
        inicio: { gte: inicio, lte: fim },
        status: { notIn: ['CANCELADO', 'NAO_COMPARECEU'] },
      },
    })
  },

  async agendamentosMes(barbeariaId: string) {
    const { inicio, fim } = businessMonthRange(new Date())

    return prisma.agendamento.count({
      where: {
        barbeariaId,
        inicio: { gte: inicio, lte: fim },
        status: { notIn: ['CANCELADO', 'NAO_COMPARECEU'] },
      },
    })
  },

  async clientesAtivos(barbeariaId: string) {
    return prisma.cliente.count({
      where: {
        barbeariaId,
        usuario: { ativo: true },
      },
    })
  },

  async assinaturasAtivas(barbeariaId: string) {
    return prisma.assinatura.count({
      where: {
        plano: { barbeariaId },
        status: 'ATIVA',
      },
    })
  },

  async barbeirosRanking(barbeariaId: string) {
    const { inicio, fim } = businessMonthRange(new Date())

    const resultado = await prisma.agendamento.groupBy({
      by: ['barbeiroId'],
      where: {
        barbeariaId,
        inicio: { gte: inicio, lte: fim },
        status: { notIn: ['CANCELADO', 'NAO_COMPARECEU'] },
      },
      _count: { barbeiroId: true },
      orderBy: { _count: { barbeiroId: 'desc' } },
      take: 5,
    })

    const barbeirosIds = resultado.map((r) => r.barbeiroId)

    const barbeiros = await prisma.barbeiro.findMany({
      where: { id: { in: barbeirosIds } },
      include: { usuario: { select: { nome: true } } },
    })

    return resultado.map((r) => ({
      barbeiro: barbeiros.find((b) => b.id === r.barbeiroId),
      total: r._count.barbeiroId,
    }))
  },

  async servicosRanking(barbeariaId: string) {
    const { inicio, fim } = businessMonthRange(new Date())

    const resultado = await prisma.agendamento.groupBy({
      by: ['servicoId'],
      where: {
        barbeariaId,
        inicio: { gte: inicio, lte: fim },
        status: { notIn: ['CANCELADO', 'NAO_COMPARECEU'] },
      },
      _count: { servicoId: true },
      orderBy: { _count: { servicoId: 'desc' } },
      take: 5,
    })

    const servicosIds = resultado.map((r) => r.servicoId)

    const servicos = await prisma.servico.findMany({
      where: { id: { in: servicosIds } },
    })

    return resultado.map((r) => ({
      servico: servicos.find((s) => s.id === r.servicoId),
      total: r._count.servicoId,
    }))
  },

  async receitaMes(barbeariaId: string) {
    const { inicio, fim } = businessMonthRange(new Date())

    const pagamentosAprovados = await prisma.pagamento.aggregate({
      where: {
        barbeariaId,
        status: 'APROVADO',
        agendamentoId: null,
        criadoEm: { gte: inicio, lte: fim },
      },
      _sum: { valor: true },
    })

    const agendamentosConcluidos = await prisma.agendamento.findMany({
      where: {
        barbeariaId,
        status: 'CONCLUIDO',
        assinaturaId: null,
        inicio: { gte: inicio, lte: fim },
      },
      select: {
        servico: { select: { preco: true } },
      },
    })

    const receitaServicosConcluidos = agendamentosConcluidos.reduce(
      (total, agendamento) => total + Number(agendamento.servico.preco),
      0
    )

    return Number(pagamentosAprovados._sum.valor ?? 0) + receitaServicosConcluidos
  },

  async servicosConcluidosMes(barbeariaId: string) {
    const { inicio, fim } = businessMonthRange(new Date())

    return prisma.agendamento.count({
      where: {
        barbeariaId,
        status: 'CONCLUIDO',
        inicio: { gte: inicio, lte: fim },
      },
    })
  },

  async clientesRecorrentesMes(barbeariaId: string) {
    const { inicio, fim } = businessMonthRange(new Date())

    const agendamentos = await prisma.agendamento.findMany({
      where: {
        barbeariaId,
        status: 'CONCLUIDO',
        inicio: { gte: inicio, lte: fim },
      },
      select: { clienteId: true },
    })

    const totalPorCliente = agendamentos.reduce<Record<string, number>>((acc, agendamento) => {
      acc[agendamento.clienteId] = (acc[agendamento.clienteId] ?? 0) + 1
      return acc
    }, {})

    return Object.values(totalPorCliente).filter((total) => total >= 2).length
  },

  async agendamentosPendentes(barbeariaId: string) {
    return prisma.agendamento.count({
      where: {
        barbeariaId,
        status: 'PENDENTE',
        inicio: { gte: new Date() },
      },
    })
  },

  async horariosVagosHoje(barbeariaId: string) {
    const agora = new Date()
    const { inicio, fim } = businessDayRange(agora)
    const diaSemana = businessWeekday(agora)
    const minutoAtual = businessMinutes(agora)

    const servicoMaisCurto = await prisma.servico.findFirst({
      where: { barbeariaId, ativo: true },
      orderBy: { duracao: 'asc' },
      select: { duracao: true },
    })

    const duracaoBase = servicoMaisCurto?.duracao ?? 30

    const barbeiros = await prisma.barbeiro.findMany({
      where: { barbeariaId, ativo: true, usuario: { ativo: true } },
      select: {
        id: true,
        disponibilidades: {
          where: { diaSemana },
          select: { horaInicio: true, horaFim: true },
        },
        folgas: {
          where: { data: { gte: inicio, lte: fim } },
          select: { id: true },
        },
        bloqueios: {
          where: { inicio: { lt: fim }, fim: { gt: agora } },
          select: { inicio: true, fim: true },
        },
        agendamentos: {
          where: {
            status: { notIn: ['CANCELADO', 'NAO_COMPARECEU'] },
            inicio: { lt: fim },
            fim: { gt: agora },
          },
          select: { inicio: true, fim: true },
        },
      },
    })

    const minutosLivres = barbeiros.reduce((total, barbeiro) => {
      if (barbeiro.folgas.length > 0) return total

      return total + barbeiro.disponibilidades.reduce((totalDia, disponibilidade) => {
        const inicioDisponivel = Math.max(horarioParaMinutos(disponibilidade.horaInicio), minutoAtual)
        const fimDisponivel = horarioParaMinutos(disponibilidade.horaFim)
        const minutosDisponiveis = Math.max(0, fimDisponivel - inicioDisponivel)

        const minutosOcupados = [...barbeiro.agendamentos, ...barbeiro.bloqueios].reduce(
          (ocupados, item) =>
            ocupados + minutosSobrepostos(
              inicioDisponivel,
              fimDisponivel,
              businessMinutes(item.inicio),
              businessMinutes(item.fim)
            ),
          0
        )

        return totalDia + Math.max(0, minutosDisponiveis - minutosOcupados)
      }, 0)
    }, 0)

    return Math.floor(minutosLivres / duracaoBase)
  },
}
