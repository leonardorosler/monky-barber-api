import prisma from '../../shared/lib/prisma'
import type { AtualizarBarbeiroDTO } from './barbeiros.validator'

export const barbeirosRepository = {
  async criar(dados: {
    barbeariaId: string
    nome: string
    email: string
    senha: string
    foto?: string
    bio?: string
  }) {
    return prisma.usuario.create({
      data: {
        barbeariaId: dados.barbeariaId,
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha,
        papel: 'BARBEIRO',
        barbeiro: {
          create: {
            barbeariaId: dados.barbeariaId,
            foto: dados.foto,
            bio: dados.bio,
          },
        },
      },
      include: { barbeiro: true },
    })
  },

  async listar(barbeariaId: string) {
    return prisma.barbeiro.findMany({
      where: { barbeariaId },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, ativo: true },
        },
      },
      orderBy: { usuario: { nome: 'asc' } },
    })
  },

  async buscarPorId(id: string, barbeariaId: string) {
    return prisma.barbeiro.findFirst({
      where: { id, barbeariaId },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, ativo: true },
        },
      },
    })
  },

  async buscarPorUsuarioId(usuarioId: string, barbeariaId?: string) {
    return prisma.barbeiro.findFirst({
      where: {
        usuarioId,
        ...(barbeariaId ? { barbeariaId } : {}),
      },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, ativo: true },
        },
      },
    })
  },

  async atualizar(id: string, dados: AtualizarBarbeiroDTO) {
    const { nome, ativo, ...dadosBarbeiro } = dados

    return prisma.barbeiro.update({
      where: { id },
      data: {
        ...dadosBarbeiro,
        usuario: nome || ativo !== undefined
          ? { update: { ...(nome && { nome }), ...(ativo !== undefined && { ativo }) } }
          : undefined,
      },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, ativo: true },
        },
      },
    })
  },
}
