import prisma from '../../shared/lib/prisma'
import { businessDayRange, businessMonthRange } from '../../shared/utils/date.utils'

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
}
