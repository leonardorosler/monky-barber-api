import { barbeariaRepository } from './barbearia.repository'
import { ErroAplicacao } from '../../shared/middlewares/error.middleware'
import type { CriarBarbeariaDTO, AtualizarBarbeariaDTO } from './barbearia.validator'

export const barbeariaService = {
  async criar(dados: CriarBarbeariaDTO) {
    const slugEmUso = await barbeariaRepository.slugExiste(dados.slug)

    if (slugEmUso) {
      throw new ErroAplicacao('Este slug já está em uso.', 409)
    }

    return barbeariaRepository.criar(dados)
  },

  async buscarPorId(id: string) {
    const barbearia = await barbeariaRepository.buscarPorId(id)

    if (!barbearia) {
      throw new ErroAplicacao('Barbearia não encontrada.', 404)
    }

    return barbearia
  },

  async buscarPorSlug(slug: string) {
    const barbearia = await barbeariaRepository.buscarPorSlug(slug)

    if (!barbearia) {
      throw new ErroAplicacao('Barbearia não encontrada.', 404)
    }

    return barbearia
  },

  async atualizar(id: string, dados: AtualizarBarbeariaDTO) {
    await barbeariaService.buscarPorId(id)
    return barbeariaRepository.atualizar(id, dados)
  },
}
