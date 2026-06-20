import prisma from '../../shared/lib/prisma'
import type { CriarFolgaDTO } from './folgas.validator'
import { businessDayRange } from '../../shared/utils/date.utils'

export const folgasRepository = {
  async criar(barbeiroId: string, dados: CriarFolgaDTO) {
    return prisma.folga.create({
      data: { barbeiroId, ...dados },
    })
  },

  async listar(barbeiroId: string) {
    const hoje = businessDayRange(new Date())

    return prisma.folga.findMany({
      where: {
        barbeiroId,
        data: { gte: hoje.inicio },
      },
      orderBy: { data: 'asc' },
    })
  },

  async buscarPorId(id: string, barbeiroId: string) {
    return prisma.folga.findFirst({
      where: { id, barbeiroId },
    })
  },

  async deletar(id: string) {
    return prisma.folga.delete({ where: { id } })
  },

  async existeNaData(barbeiroId: string, data: Date) {
    const { inicio, fim } = businessDayRange(data)

    const folga = await prisma.folga.findFirst({
      where: {
        barbeiroId,
        data: { gte: inicio, lte: fim },
      },
    })

    return !!folga
  },
}
