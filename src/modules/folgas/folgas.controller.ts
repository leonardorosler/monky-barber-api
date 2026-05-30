import { Request, Response, NextFunction } from 'express'
import { folgasService } from './folgas.service'
import { schemaCriarFolga } from './folgas.validator'

export const folgasController = {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const { barbeiroId } = req.params
      const dados = schemaCriarFolga.parse(req.body)
      const folga = await folgasService.criar(barbeiroId, req.barbeariaId!, dados)
      res.status(201).json(folga)
    } catch (err) {
      next(err)
    }
  },

  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { barbeiroId } = req.params
      const folgas = await folgasService.listar(barbeiroId, req.barbeariaId!)
      res.json(folgas)
    } catch (err) {
      next(err)
    }
  },

  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { barbeiroId, id } = req.params
      await folgasService.deletar(id, barbeiroId, req.barbeariaId!)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },
}
