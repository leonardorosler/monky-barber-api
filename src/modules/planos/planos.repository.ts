import prisma from '../../shared/lib/prisma'
import type { CriarPlanoDTO, AtualizarPlanoDTO } from './planos.validator'

export const planosRepository = {
  async criar(barbeariaId: string, dados: CriarPlanoDTO) {
    return prisma.plano.create({
      data: {
        barbeariaId,
        nome: dados.nome,
        descricao: dados.descricao,
        preco: dados.preco,
        planosServicos: {
          create: dados.servicos.map((s) => ({
            servicoId: s.servicoId,
            quantidade: s.quantidade,
          })),
        },
      },
      include: { planosServicos: { include: { servico: true } } },
    })
  },

  async listar(barbeariaId: string, apenasAtivos = false) {
    return prisma.plano.findMany({
      where: {
        barbeariaId,
        ...(apenasAtivos && { ativo: true }),
      },
      include: { planosServicos: { include: { servico: true } } },
      orderBy: { preco: 'asc' },
    })
  },

  async buscarPorId(id: string, barbeariaId: string) {
    return prisma.plano.findFirst({
      where: { id, barbeariaId },
      include: { planosServicos: { include: { servico: true } } },
    })
  },

  async atualizar(id: string, dados: AtualizarPlanoDTO) {
    const { servicos, ...dadosPlano } = dados

    return prisma.plano.update({
      where: { id },
      data: {
        ...dadosPlano,
        ...(servicos && {
          planosServicos: {
            deleteMany: {},
            create: servicos.map((s) => ({
              servicoId: s.servicoId,
              quantidade: s.quantidade,
            })),
          },
        }),
      },
      include: { planosServicos: { include: { servico: true } } },
    })
  },
}
