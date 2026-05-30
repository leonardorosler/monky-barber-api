import prisma from '../../shared/lib/prisma'
import type { CriarServicoDTO, AtualizarServicoDTO } from './servicos.validator'

export const servicosRepository = {
  async criar(barbeariaId: string, dados: CriarServicoDTO) {
    return prisma.servico.create({
      data: { barbeariaId, ...dados },
    })
  },

  async listar(barbeariaId: string, apenasAtivos = false) {
    return prisma.servico.findMany({
      where: {
        barbeariaId,
        ...(apenasAtivos && { ativo: true }),
      },
      orderBy: { nome: 'asc' },
    })
  },

  async buscarPorId(id: string, barbeariaId: string) {
    return prisma.servico.findFirst({
      where: { id, barbeariaId },
    })
  },

  async atualizar(id: string, dados: AtualizarServicoDTO) {
    return prisma.servico.update({
      where: { id },
      data: dados,
    })
  },
}
