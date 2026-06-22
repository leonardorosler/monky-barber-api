import prisma from '../../shared/lib/prisma'

export const assinaturasRepository = {
  async criar(dados: {
    clienteId: string
    planoId: string
    inicio: Date
    mpAssinaturaId?: string
  }) {
    return prisma.assinatura.create({
      data: {
        clienteId: dados.clienteId,
        planoId: dados.planoId,
        inicio: dados.inicio,
        mpAssinaturaId: dados.mpAssinaturaId,
      },
      include: { plano: { include: { planosServicos: { include: { servico: true } } } } },
    })
  },

  async listarPorBarbearia(barbeariaId: string) {
    return prisma.assinatura.findMany({
      where: { plano: { barbeariaId } },
      include: {
        plano: true,
        cliente: { include: { usuario: { select: { nome: true, email: true } } } },
      },
      orderBy: { criadoEm: 'desc' },
    })
  },

  async listarPorCliente(clienteId: string) {
    return prisma.assinatura.findMany({
      where: { clienteId },
      include: {
        plano: { include: { planosServicos: { include: { servico: true } } } },
      },
      orderBy: { criadoEm: 'desc' },
    })
  },

  async buscarPorId(id: string) {
    return prisma.assinatura.findUnique({
      where: { id },
      include: {
        plano: { include: { planosServicos: { include: { servico: true } } } },
        cliente: { include: { usuario: { select: { nome: true, email: true } } } },
      },
    })
  },

  async buscarPorMpId(mpAssinaturaId: string) {
    return prisma.assinatura.findFirst({ where: { mpAssinaturaId } })
  },

  async atualizarStatus(id: string, status: string, mpAssinaturaId?: string) {
    return prisma.assinatura.update({
      where: { id },
      data: {
        status: status as any,
        ...(mpAssinaturaId && { mpAssinaturaId }),
      },
    })
  },

  async assinaturaAtivaDoCliente(clienteId: string, planoId: string) {
    return prisma.assinatura.findFirst({
      where: { clienteId, planoId, status: 'ATIVA' },
    })
  },

  async assinaturaAtivaPorCliente(clienteId: string) {
    return prisma.assinatura.findFirst({
      where: { clienteId, status: 'ATIVA' },
      include: { plano: { include: { planosServicos: { include: { servico: true } } } } },
      orderBy: { criadoEm: 'desc' },
    })
  },

  async listarAgendamentosDoPlano(clienteId: string, inicio: Date, fim: Date) {
    return prisma.agendamento.findMany({
      where: {
        clienteId,
        inicio: { gte: inicio, lte: fim },
        status: { in: ['PENDENTE', 'CONFIRMADO', 'CONCLUIDO'] },
      },
      select: { id: true, servicoId: true, status: true, assinaturaId: true },
    })
  },
}
