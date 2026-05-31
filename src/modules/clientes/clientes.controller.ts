import { Request, Response, NextFunction } from 'express'
import { clientesService } from './clientes.service'
import { schemaAtualizarCliente } from './clientes.validator'

export const clientesController = {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const clientes = await clientesService.listar(req.barbeariaId!)
      res.json(clientes)
    } catch (err) {
      next(err)
    }
  },

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const cliente = await clientesService.buscarPorId(id, req.barbeariaId!)
      res.json(cliente)
    } catch (err) {
      next(err)
    }
  },

  // cliente autenticado busca o próprio perfil
  async buscarPerfil(req: Request, res: Response, next: NextFunction) {
    try {
      const cliente = await clientesService.buscarPerfil(req.usuario!.id)
      res.json(cliente)
    } catch (err) {
      next(err)
    }
  },

  // admin atualiza dados de um cliente
  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const dados = schemaAtualizarCliente.parse(req.body)
      const cliente = await clientesService.atualizar(id, req.barbeariaId!, dados)
      res.json(cliente)
    } catch (err) {
      next(err)
    }
  },

  // cliente atualiza o próprio perfil
  async atualizarPerfil(req: Request, res: Response, next: NextFunction) {
    try {
      const dados = schemaAtualizarCliente.parse(req.body)
      const cliente = await clientesService.atualizarPerfil(req.usuario!.id, dados)
      res.json(cliente)
    } catch (err) {
      next(err)
    }
  },
}
