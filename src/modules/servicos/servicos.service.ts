import { servicosRepository } from './servicos.repository'
import { ErroAplicacao } from '../../shared/middlewares/error.middleware'
import type { CriarServicoDTO, AtualizarServicoDTO } from './servicos.validator'

export const servicosService = {
  async criar(barbeariaId: string, dados: CriarServicoDTO) {
    return servicosRepository.criar(barbeariaId, dados)
  },

  async listar(barbeariaId: string, apenasAtivos = false) {
    return servicosRepository.listar(barbeariaId, apenasAtivos)
  },

  async buscarPorId(id: string, barbeariaId: string) {
    const servico = await servicosRepository.buscarPorId(id, barbeariaId)

    if (!servico) {
      throw new ErroAplicacao('Serviço não encontrado.', 404)
    }

    return servico
  },

  async atualizar(id: string, barbeariaId: string, dados: AtualizarServicoDTO) {
    await servicosService.buscarPorId(id, barbeariaId)
    return servicosRepository.atualizar(id, dados)
  },
}
