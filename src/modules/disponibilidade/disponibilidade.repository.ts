import prisma from '../../shared/lib/prisma'
import type { DisponibilidadeDTO } from './disponibilidade.validator'

export const disponibilidadeRepository = {
  async definir(barbeiroId: string, disponibilidades: DisponibilidadeDTO[]) {
    // substitui todas as disponibilidades do barbeiro de uma vez
    await prisma.disponibilidade.deleteMany({ where: { barbeiroId } })

    return prisma.disponibilidade.createMany({
      data: disponibilidades.map((d) => ({ barbeiroId, ...d })),
    })
  },

  async listarPorBarbeiro(barbeiroId: string) {
    return prisma.disponibilidade.findMany({
      where: { barbeiroId },
      orderBy: { diaSemana: 'asc' },
    })
  },
}
