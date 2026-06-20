import prisma from '../../shared/lib/prisma'
import { businessDayRange } from '../../shared/utils/date.utils'

export const agendamentosRepository = {
  async criar(dados: {
    barbeariaId: string
    clienteId: string
    barbeiroId: string
    servicoId: string
    inicio: Date
    fim: Date
  }) {
    return prisma.agendamento.create({
      data: dados,
      include: {
        barbeiro: { include: { usuario: { select: { nome: true } } } },
        servico: true,
        cliente: { include: { usuario: { select: { nome: true } } } },
      },
    })
  },

  async listarPorBarbearia(barbeariaId: string, filtros?: { data?: Date; status?: string }) {
    const intervalo = filtros?.data ? businessDayRange(filtros.data) : undefined

    return prisma.agendamento.findMany({
      where: {
        barbeariaId,
        ...(filtros?.status && { status: filtros.status as any }),
        ...(filtros?.data && {
          inicio: {
            gte: intervalo!.inicio,
            lte: intervalo!.fim,
          },
        }),
      },
      include: {
        barbeiro: { include: { usuario: { select: { nome: true } } } },
        servico: true,
        cliente: { include: { usuario: { select: { nome: true } } } },
      },
      orderBy: { inicio: 'asc' },
    })
  },

  async listarPorCliente(clienteId: string) {
    return prisma.agendamento.findMany({
      where: { clienteId },
      include: {
        barbeiro: { include: { usuario: { select: { nome: true } } } },
        servico: true,
      },
      orderBy: { inicio: 'desc' },
    })
  },

  async listarPorBarbeiro(barbeiroId: string, data?: Date) {
    const intervalo = data ? businessDayRange(data) : undefined

    return prisma.agendamento.findMany({
      where: {
        barbeiroId,
        status: { notIn: ['CANCELADO', 'NAO_COMPARECEU'] },
        ...(data && {
          inicio: {
            gte: intervalo!.inicio,
            lte: intervalo!.fim,
          },
        }),
      },
      include: {
        servico: true,
        cliente: { include: { usuario: { select: { nome: true } } } },
      },
      orderBy: { inicio: 'asc' },
    })
  },

  async buscarPorId(id: string, barbeariaId: string) {
    return prisma.agendamento.findFirst({
      where: { id, barbeariaId },
      include: {
        barbeiro: { include: { usuario: { select: { nome: true } } } },
        servico: true,
        cliente: { include: { usuario: { select: { nome: true } } } },
      },
    })
  },

  async atualizarStatus(id: string, status: string) {
    return prisma.agendamento.update({
      where: { id },
      data: { status: status as any },
    })
  },

  async existeConflito(barbeiroId: string, inicio: Date, fim: Date, ignorarId?: string) {
    const agendamento = await prisma.agendamento.findFirst({
      where: {
        barbeiroId,
        status: { notIn: ['CANCELADO', 'NAO_COMPARECEU'] },
        inicio: { lt: fim },
        fim: { gt: inicio },
        ...(ignorarId && { id: { not: ignorarId } }),
      },
    })

    return !!agendamento
  },
}
