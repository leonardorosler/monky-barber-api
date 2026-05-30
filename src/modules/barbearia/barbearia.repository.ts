import prisma from '../../shared/lib/prisma'
import type { CriarBarbeariaDTO, AtualizarBarbeariaDTO } from './barbearia.validator'

export const barbeariaRepository = {
  async criar(dados: CriarBarbeariaDTO) {
    return prisma.barbearia.create({ data: dados })
  },

  async buscarPorId(id: string) {
    return prisma.barbearia.findUnique({ where: { id } })
  },

  async buscarPorSlug(slug: string) {
    return prisma.barbearia.findUnique({ where: { slug } })
  },

  async slugExiste(slug: string) {
    const barbearia = await prisma.barbearia.findUnique({
      where: { slug },
      select: { id: true },
    })
    return !!barbearia
  },

  async atualizar(id: string, dados: AtualizarBarbeariaDTO) {
    return prisma.barbearia.update({ where: { id }, data: dados })
  },
}
