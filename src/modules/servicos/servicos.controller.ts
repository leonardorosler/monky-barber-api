import { Request, Response, NextFunction } from 'express'
import { servicosService } from './servicos.service'
import { schemaCriarServico, schemaAtualizarServico } from './servicos.validator'
import { pegarParam } from '../../shared/utils/req.utils'

export const servicosController = {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const dados = schemaCriarServico.parse(req.body)
      const servico = await servicosService.criar(req.barbeariaId!, dados)
      res.status(201).json(servico)
    } catch (err) {
      next(err)
    }
  },

  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      // clientes e visitantes veem apenas ativos
      // admin vê todos
      const apenasAtivos = req.usuario?.papel !== 'ADMIN'
      const servicos = await servicosService.listar(req.barbeariaId!, apenasAtivos)
      res.json(servicos)
    } catch (err) {
      next(err)
    }
  },

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const id = pegarParam(req, 'id')
      const servico = await servicosService.buscarPorId(id, req.barbeariaId!)
      res.json(servico)
    } catch (err) {
      next(err)
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = pegarParam(req, 'id')
      const dados = schemaAtualizarServico.parse(req.body)
      const servico = await servicosService.atualizar(id, req.barbeariaId!, dados)
      res.json(servico)
    } catch (err) {
      next(err)
    }
  },
}
