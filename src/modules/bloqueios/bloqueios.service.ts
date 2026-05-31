import { bloqueiosRepository } from './bloqueios.repository'
import { barbeirosRepository } from '../barbeiros/barbeiros.repository'
import { ErroAplicacao } from '../../shared/middlewares/error.middleware'
import type { CriarBloqueioDTO } from './bloqueios.validator'

export const bloqueiosService = {
  async criar(barbeiroId: string, barbeariaId: string, dados: CriarBloqueioDTO) {
    const barbeiro = await barbeirosRepository.buscarPorId(barbeiroId, barbeariaId)

    if (!barbeiro) {
      throw new ErroAplicacao('Barbeiro não encontrado.', 404)
    }

    if (dados.inicio < new Date()) {
      throw new ErroAplicacao('Não é possível bloquear horários no passado.', 400)
    }

    const temConflito = await bloqueiosRepository.existeConflito(
      barbeiroId,
      dados.inicio,
      dados.fim
    )

    if (temConflito) {
      throw new ErroAplicacao('Já existe um bloqueio neste intervalo.', 409)
    }

    return bloqueiosRepository.criar(barbeiroId, dados)
  },

  async listar(barbeiroId: string, barbeariaId: string) {
    const barbeiro = await barbeirosRepository.buscarPorId(barbeiroId, barbeariaId)

    if (!barbeiro) {
      throw new ErroAplicacao('Barbeiro não encontrado.', 404)
    }

    return bloqueiosRepository.listar(barbeiroId)
  },

  async deletar(id: string, barbeiroId: string, barbeariaId: string) {
    const barbeiro = await barbeirosRepository.buscarPorId(barbeiroId, barbeariaId)

    if (!barbeiro) {
      throw new ErroAplicacao('Barbeiro não encontrado.', 404)
    }

    const bloqueio = await bloqueiosRepository.buscarPorId(id, barbeiroId)

    if (!bloqueio) {
      throw new ErroAplicacao('Bloqueio não encontrado.', 404)
    }

    return bloqueiosRepository.deletar(id)
  },
}
