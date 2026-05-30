import prisma from '../../shared/lib/prisma'

export const authRepository = {
  async buscarUsuarioPorEmail(email: string, barbeariaId: string) {
    return prisma.usuario.findUnique({
      where: { email_barbeariaId: { email, barbeariaId } },
    })
  },

  async criarUsuarioCliente(dados: {
    barbeariaId: string
    nome: string
    email: string
    senha: string
    telefone?: string
  }) {
    return prisma.usuario.create({
      data: {
        barbeariaId: dados.barbeariaId,
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha,
        papel: 'CLIENTE',
        cliente: {
          create: {
            barbeariaId: dados.barbeariaId,
            telefone: dados.telefone,
          },
        },
      },
    })
  },

  async salvarRefreshToken(dados: {
    usuarioId: string
    token: string
    expiracao: Date
  }) {
    return prisma.tokenAtualizacao.create({
      data: {
        usuarioId: dados.usuarioId,
        token: dados.token,
        expiracao: dados.expiracao,
      },
    })
  },

  async buscarRefreshToken(token: string) {
    return prisma.tokenAtualizacao.findUnique({
      where: { token },
      include: { usuario: true },
    })
  },

  async deletarRefreshToken(token: string) {
    return prisma.tokenAtualizacao.delete({ where: { token } })
  },

  async deletarRefreshTokensDoUsuario(usuarioId: string) {
    return prisma.tokenAtualizacao.deleteMany({ where: { usuarioId } })
  },

  async criarTokenRedefinicao(dados: {
    usuarioId: string
    token: string
    expiracao: Date
  }) {
    return prisma.tokenRedefinicaoSenha.create({
      data: {
        usuarioId: dados.usuarioId,
        token: dados.token,
        expiracao: dados.expiracao,
      },
    })
  },

  async buscarTokenRedefinicao(token: string) {
    return prisma.tokenRedefinicaoSenha.findUnique({
      where: { token },
      include: { usuario: true },
    })
  },

  async marcarTokenRedefinicaoComoUsado(id: string) {
    return prisma.tokenRedefinicaoSenha.update({
      where: { id },
      data: { usado: true },
    })
  },

  async atualizarSenha(usuarioId: string, novaSenha: string) {
    return prisma.usuario.update({
      where: { id: usuarioId },
      data: { senha: novaSenha },
    })
  },
}
