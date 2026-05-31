import prisma from '../../shared/lib/prisma'

export const dashboardRepository = {
  async agendamentosHoje(barbeariaId: string) {
    const hoje = new Date()
    const inicio = new Date(hoje.setHours(0, 0, 0, 0))
    const fim = new Date(hoje.setHours(23, 59, 59, 999))

    return prisma.agendamento.count({
      where: {
        barbeariaId,
        inicio: { gte: inicio, lte: fim },
        status: { notIn: ['CANCELADO', 'NAO_COMPARECEU'] },
      },
    })
  },

  async agendamentosMes(barbeariaId: string) {
    const hoje = new Date()
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59)

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
    const hoje = new Date()
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59)

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
    const hoje = new Date()
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59)

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
    const hoje = new Date()
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59)

    const resultado = await prisma.pagamento.aggregate({
      where: {
        barbeariaId,
        status: 'APROVADO',
        criadoEm: { gte: inicio, lte: fim },
      },
      _sum: { valor: true },
    })

    return resultado._sum.valor ?? 0
  },
}
