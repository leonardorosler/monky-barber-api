import prisma from '../../shared/lib/prisma'
import type { AtualizarClienteDTO } from './clientes.validator'

export const clientesRepository = {
  async listar(barbeariaId: string) {
    return prisma.cliente.findMany({
      where: { barbeariaId },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, ativo: true, criadoEm: true },
        },
      },
      orderBy: { usuario: { nome: 'asc' } },
    })
  },

  async buscarPorId(id: string, barbeariaId: string) {
    return prisma.cliente.findFirst({
      where: { id, barbeariaId },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, ativo: true, criadoEm: true },
        },
      },
    })
  },

  async buscarPorUsuarioId(usuarioId: string) {
    return prisma.cliente.findUnique({
      where: { usuarioId },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, ativo: true },
        },
      },
    })
  },

  async atualizar(id: string, dados: AtualizarClienteDTO) {
    const { nome, ...dadosCliente } = dados

    return prisma.cliente.update({
      where: { id },
      data: {
        ...dadosCliente,
        ...(nome && { usuario: { update: { nome } } }),
      },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, ativo: true },
        },
      },
    })
  },
}
