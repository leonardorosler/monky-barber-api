import { Request, Response, NextFunction } from 'express'
import { bloqueiosService } from './bloqueios.service'
import { schemaCriarBloqueio } from './bloqueios.validator'

export const bloqueiosController = {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const { barbeiroId } = req.params
      const dados = schemaCriarBloqueio.parse(req.body)
      const bloqueio = await bloqueiosService.criar(barbeiroId, req.barbeariaId!, dados)
      res.status(201).json(bloqueio)
    } catch (err) {
      next(err)
    }
  },

  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { barbeiroId } = req.params
      const bloqueios = await bloqueiosService.listar(barbeiroId, req.barbeariaId!)
      res.json(bloqueios)
    } catch (err) {
      next(err)
    }
  },

  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { barbeiroId, id } = req.params
      await bloqueiosService.deletar(id, barbeiroId, req.barbeariaId!)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },
}
