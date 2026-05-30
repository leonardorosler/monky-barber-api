import { folgasRepository } from './folgas.repository'
import { barbeirosRepository } from '../barbeiros/barbeiros.repository'
import { ErroAplicacao } from '../../shared/middlewares/error.middleware'
import type { CriarFolgaDTO } from './folgas.validator'

export const folgasService = {
  async criar(barbeiroId: string, barbeariaId: string, dados: CriarFolgaDTO) {
    const barbeiro = await barbeirosRepository.buscarPorId(barbeiroId, barbeariaId)

    if (!barbeiro) {
      throw new ErroAplicacao('Barbeiro não encontrado.', 404)
    }

    if (dados.data < new Date()) {
      throw new ErroAplicacao('Não é possível cadastrar folga em data passada.', 400)
    }

    const jaExiste = await folgasRepository.existeNaData(barbeiroId, dados.data)

    if (jaExiste) {
      throw new ErroAplicacao('Já existe uma folga cadastrada nesta data.', 409)
    }

    return folgasRepository.criar(barbeiroId, dados)
  },

  async listar(barbeiroId: string, barbeariaId: string) {
    const barbeiro = await barbeirosRepository.buscarPorId(barbeiroId, barbeariaId)

    if (!barbeiro) {
      throw new ErroAplicacao('Barbeiro não encontrado.', 404)
    }

    return folgasRepository.listar(barbeiroId)
  },

  async deletar(id: string, barbeiroId: string, barbeariaId: string) {
    const barbeiro = await barbeirosRepository.buscarPorId(barbeiroId, barbeariaId)

    if (!barbeiro) {
      throw new ErroAplicacao('Barbeiro não encontrado.', 404)
    }

    const folga = await folgasRepository.buscarPorId(id, barbeiroId)

    if (!folga) {
      throw new ErroAplicacao('Folga não encontrada.', 404)
    }

    return folgasRepository.deletar(id)
  },
}
