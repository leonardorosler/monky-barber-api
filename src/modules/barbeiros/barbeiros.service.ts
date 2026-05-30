import bcrypt from 'bcryptjs'
import { barbeirosRepository } from './barbeiros.repository'
import { authRepository } from '../auth/auth.repository'
import { ErroAplicacao } from '../../shared/middlewares/error.middleware'
import type { CriarBarbeiroDTO, AtualizarBarbeiroDTO } from './barbeiros.validator'

export const barbeirosService = {
  async criar(barbeariaId: string, dados: CriarBarbeiroDTO) {
    const usuarioExistente = await authRepository.buscarUsuarioPorEmail(
      dados.email,
      barbeariaId
    )

    if (usuarioExistente) {
      throw new ErroAplicacao('E-mail já cadastrado nesta barbearia.', 409)
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10)

    const usuario = await barbeirosRepository.criar({
      barbeariaId,
      nome: dados.nome,
      email: dados.email,
      senha: senhaHash,
      foto: dados.foto,
      bio: dados.bio,
    })

    return usuario
  },

  async listar(barbeariaId: string) {
    return barbeirosRepository.listar(barbeariaId)
  },

  async buscarPorId(id: string, barbeariaId: string) {
    const barbeiro = await barbeirosRepository.buscarPorId(id, barbeariaId)

    if (!barbeiro) {
      throw new ErroAplicacao('Barbeiro não encontrado.', 404)
    }

    return barbeiro
  },

  async atualizar(id: string, barbeariaId: string, dados: AtualizarBarbeiroDTO) {
    await barbeirosService.buscarPorId(id, barbeariaId)
    return barbeirosRepository.atualizar(id, dados)
  },
}
