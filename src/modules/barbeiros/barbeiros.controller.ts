import { Request, Response, NextFunction } from 'express'
import { barbeirosService } from './barbeiros.service'
import { schemaCriarBarbeiro, schemaAtualizarBarbeiro } from './barbeiros.validator'

export const barbeirosController = {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const dados = schemaCriarBarbeiro.parse(req.body)
      const barbeiro = await barbeirosService.criar(req.barbeariaId!, dados)
      res.status(201).json(barbeiro)
    } catch (err) {
      next(err)
    }
  },

  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const barbeiros = await barbeirosService.listar(req.barbeariaId!)
      res.json(barbeiros)
    } catch (err) {
      next(err)
    }
  },

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string
      const barbeiro = await barbeirosService.buscarPorId(id, req.barbeariaId!)
      res.json(barbeiro)
    } catch (err) {
      next(err)
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const barbeiro = await barbeirosService.buscarMeuPerfil(req.usuario!.id, req.barbeariaId!)
      res.json(barbeiro)
    } catch (err) {
      next(err)
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string
      const dados = schemaAtualizarBarbeiro.parse(req.body)
      const barbeiro = await barbeirosService.atualizar(id, req.barbeariaId!, dados)
      res.json(barbeiro)
    } catch (err) {
      next(err)
    }
  },

  async atualizarMe(req: Request, res: Response, next: NextFunction) {
    try {
      const dados = schemaAtualizarBarbeiro.parse(req.body)
      const barbeiro = await barbeirosService.atualizarMeuPerfil(req.usuario!.id, req.barbeariaId!, dados)
      res.json(barbeiro)
    } catch (err) {
      next(err)
    }
  },
}
