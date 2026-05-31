import { planosRepository } from './planos.repository'
import { servicosRepository } from '../servicos/servicos.repository'
import { ErroAplicacao } from '../../shared/middlewares/error.middleware'
import type { CriarPlanoDTO, AtualizarPlanoDTO } from './planos.validator'

export const planosService = {
  async criar(barbeariaId: string, dados: CriarPlanoDTO) {
    // valida se todos os serviços pertencem à barbearia
    for (const s of dados.servicos) {
      const servico = await servicosRepository.buscarPorId(s.servicoId, barbeariaId)
      if (!servico) {
        throw new ErroAplicacao(`Serviço ${s.servicoId} não encontrado.`, 404)
      }
    }

    return planosRepository.criar(barbeariaId, dados)
  },

  async listar(barbeariaId: string, apenasAtivos = false) {
    return planosRepository.listar(barbeariaId, apenasAtivos)
  },

  async buscarPorId(id: string, barbeariaId: string) {
    const plano = await planosRepository.buscarPorId(id, barbeariaId)

    if (!plano) {
      throw new ErroAplicacao('Plano não encontrado.', 404)
    }

    return plano
  },

  async atualizar(id: string, barbeariaId: string, dados: AtualizarPlanoDTO) {
    await planosService.buscarPorId(id, barbeariaId)

    if (dados.servicos) {
      for (const s of dados.servicos) {
        const servico = await servicosRepository.buscarPorId(s.servicoId, barbeariaId)
        if (!servico) {
          throw new ErroAplicacao(`Serviço ${s.servicoId} não encontrado.`, 404)
        }
      }
    }

    return planosRepository.atualizar(id, dados)
  },
}
