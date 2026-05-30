import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { authRepository } from './auth.repository'
import { ErroAplicacao } from '../../shared/middlewares/error.middleware'
import type {
  CadastroDTO,
  LoginDTO,
  RefreshTokenDTO,
  EsqueceuSenhaDTO,
  RedefinirSenhaDTO,
} from './auth.validator'

const JWT_SECRET = process.env.JWT_SECRET as string
const JWT_EXPIRACAO = process.env.JWT_EXPIRACAO || '15m'
const JWT_REFRESH_EXPIRACAO = process.env.JWT_REFRESH_EXPIRACAO || '7d'

function gerarAccessToken(payload: {
  id: string
  barbeariaId: string
  papel: string
}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRACAO } as jwt.SignOptions)
}

function gerarRefreshToken() {
  return crypto.randomBytes(64).toString('hex')
}

function expiracaoRefreshToken() {
  const data = new Date()
  data.setDate(data.getDate() + 7)
  return data
}

export const authService = {
  async cadastrar(barbeariaId: string, dados: CadastroDTO) {
    const usuarioExistente = await authRepository.buscarUsuarioPorEmail(
      dados.email,
      barbeariaId
    )

    if (usuarioExistente) {
      throw new ErroAplicacao('E-mail já cadastrado nesta barbearia.', 409)
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10)

    const usuario = await authRepository.criarUsuarioCliente({
      barbeariaId,
      nome: dados.nome,
      email: dados.email,
      senha: senhaHash,
      telefone: dados.telefone,
    })

    const accessToken = gerarAccessToken({
      id: usuario.id,
      barbeariaId: usuario.barbeariaId,
      papel: usuario.papel,
    })

    const refreshToken = gerarRefreshToken()

    await authRepository.salvarRefreshToken({
      usuarioId: usuario.id,
      token: refreshToken,
      expiracao: expiracaoRefreshToken(),
    })

    return {
      accessToken,
      refreshToken,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
      },
    }
  },

  async login(barbeariaId: string, dados: LoginDTO) {
    const usuario = await authRepository.buscarUsuarioPorEmail(
      dados.email,
      barbeariaId
    )

    if (!usuario) {
      throw new ErroAplicacao('E-mail ou senha inválidos.', 401)
    }

    if (!usuario.ativo) {
      throw new ErroAplicacao('Usuário inativo. Entre em contato com a barbearia.', 403)
    }

    const senhaValida = await bcrypt.compare(dados.senha, usuario.senha)

    if (!senhaValida) {
      throw new ErroAplicacao('E-mail ou senha inválidos.', 401)
    }

    const accessToken = gerarAccessToken({
      id: usuario.id,
      barbeariaId: usuario.barbeariaId,
      papel: usuario.papel,
    })

    const refreshToken = gerarRefreshToken()

    await authRepository.salvarRefreshToken({
      usuarioId: usuario.id,
      token: refreshToken,
      expiracao: expiracaoRefreshToken(),
    })

    return {
      accessToken,
      refreshToken,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
      },
    }
  },

  async renovarToken(dados: RefreshTokenDTO) {
    const registro = await authRepository.buscarRefreshToken(dados.refreshToken)

    if (!registro) {
      throw new ErroAplicacao('Refresh token inválido.', 401)
    }

    if (registro.expiracao < new Date()) {
      await authRepository.deletarRefreshToken(dados.refreshToken)
      throw new ErroAplicacao('Refresh token expirado. Faça login novamente.', 401)
    }

    await authRepository.deletarRefreshToken(dados.refreshToken)

    const accessToken = gerarAccessToken({
      id: registro.usuario.id,
      barbeariaId: registro.usuario.barbeariaId,
      papel: registro.usuario.papel,
    })

    const novoRefreshToken = gerarRefreshToken()

    await authRepository.salvarRefreshToken({
      usuarioId: registro.usuario.id,
      token: novoRefreshToken,
      expiracao: expiracaoRefreshToken(),
    })

    return { accessToken, refreshToken: novoRefreshToken }
  },

  async logout(refreshToken: string) {
    await authRepository.deletarRefreshToken(refreshToken)
  },

  async esqueceuSenha(barbeariaId: string, dados: EsqueceuSenhaDTO) {
    const usuario = await authRepository.buscarUsuarioPorEmail(
      dados.email,
      barbeariaId
    )

    // Não revela se o e-mail existe ou não
    if (!usuario) return

    const token = crypto.randomBytes(32).toString('hex')
    const expiracao = new Date(Date.now() + 1000 * 60 * 60) // 1 hora

    await authRepository.criarTokenRedefinicao({
      usuarioId: usuario.id,
      token,
      expiracao,
    })

    // TODO: enviar e-mail com o token
    // Por enquanto loga no console em desenvolvimento
    console.log(`[DEV] Token de redefinição: ${token}`)
  },

  async redefinirSenha(dados: RedefinirSenhaDTO) {
    const registro = await authRepository.buscarTokenRedefinicao(dados.token)

    if (!registro) {
      throw new ErroAplicacao('Token inválido ou expirado.', 400)
    }

    if (registro.usado) {
      throw new ErroAplicacao('Token já utilizado.', 400)
    }

    if (registro.expiracao < new Date()) {
      throw new ErroAplicacao('Token expirado. Solicite um novo.', 400)
    }

    const senhaHash = await bcrypt.hash(dados.novaSenha, 10)

    await authRepository.atualizarSenha(registro.usuarioId, senhaHash)
    await authRepository.marcarTokenRedefinicaoComoUsado(registro.id)
    await authRepository.deletarRefreshTokensDoUsuario(registro.usuarioId)
  },
}
