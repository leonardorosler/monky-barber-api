import { assinaturasRepository } from './assinaturas.repository'
import { planosRepository } from '../planos/planos.repository'
import { clientesRepository } from '../clientes/clientes.repository'
import { ErroAplicacao } from '../../shared/middlewares/error.middleware'
import type { CriarAssinaturaDTO, AtualizarStatusAssinaturaDTO } from './assinaturas.validator'

export const assinaturasService = {
  async criar(barbeariaId: string, usuarioId: string, dados: CriarAssinaturaDTO) {
    const cliente = await clientesRepository.buscarPorUsuarioId(usuarioId)
    if (!cliente) {
      throw new ErroAplicacao('Perfil de cliente não encontrado.', 404)
    }

    const plano = await planosRepository.buscarPorId(dados.planoId, barbeariaId)
    if (!plano) {
      throw new ErroAplicacao('Plano não encontrado.', 404)
    }
    if (!plano.ativo) {
      throw new ErroAplicacao('Plano inativo.', 409)
    }

    const jaAssinou = await assinaturasRepository.assinaturaAtivaDoCliente(
      cliente.id,
      dados.planoId
    )
    if (jaAssinou) {
      throw new ErroAplicacao('Você já possui uma assinatura ativa neste plano.', 409)
    }

    return assinaturasRepository.criar({
      clienteId: cliente.id,
      planoId: dados.planoId,
      inicio: new Date(),
    })
  },

  async listarPorBarbearia(barbeariaId: string) {
    return assinaturasRepository.listarPorBarbearia(barbeariaId)
  },

  async listarPorCliente(usuarioId: string) {
    const cliente = await clientesRepository.buscarPorUsuarioId(usuarioId)
    if (!cliente) {
      throw new ErroAplicacao('Perfil de cliente não encontrado.', 404)
    }
    return assinaturasRepository.listarPorCliente(cliente.id)
  },

  async buscarPorId(id: string) {
    const assinatura = await assinaturasRepository.buscarPorId(id)
    if (!assinatura) {
      throw new ErroAplicacao('Assinatura não encontrada.', 404)
    }
    return assinatura
  },

  async cancelar(id: string, usuarioId: string, papel: string) {
    const assinatura = await assinaturasService.buscarPorId(id)

    if (papel === 'CLIENTE') {
      const cliente = await clientesRepository.buscarPorUsuarioId(usuarioId)
      if (!cliente || assinatura.clienteId !== cliente.id) {
        throw new ErroAplicacao('Acesso negado.', 403)
      }
    }

    if (assinatura.status !== 'ATIVA') {
      throw new ErroAplicacao('Apenas assinaturas ativas podem ser canceladas.', 409)
    }

    return assinaturasRepository.atualizarStatus(id, 'CANCELADA')
  },

  async atualizarStatus(id: string, dados: AtualizarStatusAssinaturaDTO) {
    await assinaturasService.buscarPorId(id)
    return assinaturasRepository.atualizarStatus(id, dados.status)
  },
}
