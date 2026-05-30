import prisma from '../../shared/lib/prisma'
import type { CriarFolgaDTO } from './folgas.validator'

export const folgasRepository = {
  async criar(barbeiroId: string, dados: CriarFolgaDTO) {
    return prisma.folga.create({
      data: { barbeiroId, ...dados },
    })
  },

  async listar(barbeiroId: string) {
    return prisma.folga.findMany({
      where: {
        barbeiroId,
        data: { gte: new Date() }, // apenas folgas futuras
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
    const inicio = new Date(data)
    inicio.setHours(0, 0, 0, 0)
    const fim = new Date(data)
    fim.setHours(23, 59, 59, 999)

    const folga = await prisma.folga.findFirst({
      where: {
        barbeiroId,
        data: { gte: inicio, lte: fim },
      },
    })

    return !!folga
  },
}
