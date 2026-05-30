import { Request, Response, NextFunction } from 'express'
import { authService } from './auth.service'
import {
  schemaCadastro,
  schemaLogin,
  schemaRefreshToken,
  schemaEsqueceuSenha,
  schemaRedefinirSenha,
} from './auth.validator'

export const authController = {
  async cadastrar(req: Request, res: Response, next: NextFunction) {
    try {
      const dados = schemaCadastro.parse(req.body)
      const resultado = await authService.cadastrar(req.barbeariaId!, dados)
      res.status(201).json(resultado)
    } catch (err) {
      next(err)
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const dados = schemaLogin.parse(req.body)
      const resultado = await authService.login(req.barbeariaId!, dados)
      res.json(resultado)
    } catch (err) {
      next(err)
    }
  },

  async renovarToken(req: Request, res: Response, next: NextFunction) {
    try {
      const dados = schemaRefreshToken.parse(req.body)
      const resultado = await authService.renovarToken(dados)
      res.json(resultado)
    } catch (err) {
      next(err)
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const dados = schemaRefreshToken.parse(req.body)
      await authService.logout(dados.refreshToken)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },

  async esqueceuSenha(req: Request, res: Response, next: NextFunction) {
    try {
      const dados = schemaEsqueceuSenha.parse(req.body)
      await authService.esqueceuSenha(req.barbeariaId!, dados)
      res.json({ mensagem: 'Se o e-mail existir, você receberá as instruções em breve.' })
    } catch (err) {
      next(err)
    }
  },

  async redefinirSenha(req: Request, res: Response, next: NextFunction) {
    try {
      const dados = schemaRedefinirSenha.parse(req.body)
      await authService.redefinirSenha(dados)
      res.json({ mensagem: 'Senha redefinida com sucesso.' })
    } catch (err) {
      next(err)
    }
  },
}
