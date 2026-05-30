import { Request, Response, NextFunction } from 'express'
import { disponibilidadeService } from './disponibilidade.service'
import { schemaDefinirDisponibilidades } from './disponibilidade.validator'

export const disponibilidadeController = {
  async definir(req: Request, res: Response, next: NextFunction) {
    try {
      const { barbeiroId } = req.params
      const dados = schemaDefinirDisponibilidades.parse(req.body)
      const resultado = await disponibilidadeService.definir(barbeiroId, req.barbeariaId!, dados)
      res.json(resultado)
    } catch (err) {
      next(err)
    }
  },

  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { barbeiroId } = req.params
      const disponibilidades = await disponibilidadeService.listar(barbeiroId, req.barbeariaId!)
      res.json(disponibilidades)
    } catch (err) {
      next(err)
    }
  },
}
