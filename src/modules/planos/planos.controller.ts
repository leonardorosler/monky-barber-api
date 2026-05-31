import { Request, Response, NextFunction } from 'express'
import { planosService } from './planos.service'
import { schemaCriarPlano, schemaAtualizarPlano } from './planos.validator'

export const planosController = {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const dados = schemaCriarPlano.parse(req.body)
      const plano = await planosService.criar(req.barbeariaId!, dados)
      res.status(201).json(plano)
    } catch (err) {
      next(err)
    }
  },

  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const apenasAtivos = req.usuario?.papel !== 'ADMIN'
      const planos = await planosService.listar(req.barbeariaId!, apenasAtivos)
      res.json(planos)
    } catch (err) {
      next(err)
    }
  },

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const plano = await planosService.buscarPorId(id, req.barbeariaId!)
      res.json(plano)
    } catch (err) {
      next(err)
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const dados = schemaAtualizarPlano.parse(req.body)
      const plano = await planosService.atualizar(id, req.barbeariaId!, dados)
      res.json(plano)
    } catch (err) {
      next(err)
    }
  },
}
