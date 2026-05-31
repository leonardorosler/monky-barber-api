import { Request, Response, NextFunction } from 'express'
import { assinaturasService } from './assinaturas.service'
import { schemaCriarAssinatura, schemaAtualizarStatusAssinatura } from './assinaturas.validator'

export const assinaturasController = {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const dados = schemaCriarAssinatura.parse(req.body)
      const assinatura = await assinaturasService.criar(
        req.barbeariaId!,
        req.usuario!.id,
        dados
      )
      res.status(201).json(assinatura)
    } catch (err) {
      next(err)
    }
  },

  async listarPorBarbearia(req: Request, res: Response, next: NextFunction) {
    try {
      const assinaturas = await assinaturasService.listarPorBarbearia(req.barbeariaId!)
      res.json(assinaturas)
    } catch (err) {
      next(err)
    }
  },

  async listarPorCliente(req: Request, res: Response, next: NextFunction) {
    try {
      const assinaturas = await assinaturasService.listarPorCliente(req.usuario!.id)
      res.json(assinaturas)
    } catch (err) {
      next(err)
    }
  },

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const assinatura = await assinaturasService.buscarPorId(req.params.id)
      res.json(assinatura)
    } catch (err) {
      next(err)
    }
  },

  async cancelar(req: Request, res: Response, next: NextFunction) {
    try {
      const assinatura = await assinaturasService.cancelar(
        req.params.id,
        req.usuario!.id,
        req.usuario!.papel
      )
      res.json(assinatura)
    } catch (err) {
      next(err)
    }
  },

  async atualizarStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const dados = schemaAtualizarStatusAssinatura.parse(req.body)
      const assinatura = await assinaturasService.atualizarStatus(req.params.id, dados)
      res.json(assinatura)
    } catch (err) {
      next(err)
    }
  },
}
