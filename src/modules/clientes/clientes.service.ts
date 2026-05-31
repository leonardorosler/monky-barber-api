import { clientesRepository } from './clientes.repository'
import { ErroAplicacao } from '../../shared/middlewares/error.middleware'
import type { AtualizarClienteDTO } from './clientes.validator'

export const clientesService = {
  async listar(barbeariaId: string) {
    return clientesRepository.listar(barbeariaId)
  },

  async buscarPorId(id: string, barbeariaId: string) {
    const cliente = await clientesRepository.buscarPorId(id, barbeariaId)

    if (!cliente) {
      throw new ErroAplicacao('Cliente não encontrado.', 404)
    }

    return cliente
  },

  async buscarPerfil(usuarioId: string) {
    const cliente = await clientesRepository.buscarPorUsuarioId(usuarioId)

    if (!cliente) {
      throw new ErroAplicacao('Perfil não encontrado.', 404)
    }

    return cliente
  },

  async atualizar(id: string, barbeariaId: string, dados: AtualizarClienteDTO) {
    await clientesService.buscarPorId(id, barbeariaId)
    return clientesRepository.atualizar(id, dados)
  },

  async atualizarPerfil(usuarioId: string, dados: AtualizarClienteDTO) {
    const cliente = await clientesRepository.buscarPorUsuarioId(usuarioId)

    if (!cliente) {
      throw new ErroAplicacao('Perfil não encontrado.', 404)
    }

    return clientesRepository.atualizar(cliente.id, dados)
  },
}
