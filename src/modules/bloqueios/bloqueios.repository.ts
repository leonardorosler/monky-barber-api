import prisma from '../../shared/lib/prisma'
import type { CriarBloqueioDTO } from './bloqueios.validator'

export const bloqueiosRepository = {
  async criar(barbeiroId: string, dados: CriarBloqueioDTO) {
    return prisma.bloqueioHorario.create({
      data: { barbeiroId, ...dados },
    })
  },

  async listar(barbeiroId: string) {
    return prisma.bloqueioHorario.findMany({
      where: {
        barbeiroId,
        fim: { gte: new Date() },
      },
      orderBy: { inicio: 'asc' },
    })
  },

  async buscarPorId(id: string, barbeiroId: string) {
    return prisma.bloqueioHorario.findFirst({
      where: { id, barbeiroId },
    })
  },

  async deletar(id: string) {
    return prisma.bloqueioHorario.delete({ where: { id } })
  },

  async existeConflito(barbeiroId: string, inicio: Date, fim: Date) {
    const bloqueio = await prisma.bloqueioHorario.findFirst({
      where: {
        barbeiroId,
        inicio: { lt: fim },
        fim: { gt: inicio },
      },
    })
    return !!bloqueio
  },
}
