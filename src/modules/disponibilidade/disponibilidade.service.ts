import { disponibilidadeRepository } from './disponibilidade.repository'
import { barbeirosRepository } from '../barbeiros/barbeiros.repository'
import { ErroAplicacao } from '../../shared/middlewares/error.middleware'
import type { DefinirDisponibilidadesDTO } from './disponibilidade.validator'

export const disponibilidadeService = {
  async definir(barbeiroId: string, barbeariaId: string, dados: DefinirDisponibilidadesDTO) {
    const barbeiro = await barbeirosRepository.buscarPorId(barbeiroId, barbeariaId)

    if (!barbeiro) {
      throw new ErroAplicacao('Barbeiro não encontrado.', 404)
    }

    return disponibilidadeRepository.definir(barbeiroId, dados.disponibilidades)
  },

  async listar(barbeiroId: string, barbeariaId: string) {
    const barbeiro = await barbeirosRepository.buscarPorId(barbeiroId, barbeariaId)

    if (!barbeiro) {
      throw new ErroAplicacao('Barbeiro não encontrado.', 404)
    }

    return disponibilidadeRepository.listarPorBarbeiro(barbeiroId)
  },
}
