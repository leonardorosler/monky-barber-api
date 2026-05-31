import { Request, Response, NextFunction } from 'express'
import { barbeariaService } from './barbearia.service'
import { schemaCriarBarbearia, schemaAtualizarBarbearia } from './barbearia.validator'

export const barbeariaController = {
  // rota interna — cria uma nova barbearia na plataforma
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const dados = schemaCriarBarbearia.parse(req.body)
      const barbearia = await barbeariaService.criar(dados)
      res.status(201).json(barbearia)
    } catch (err) {
      next(err)
    }
  },

  // rota pública — frontend busca a barbearia pelo slug pra montar a landing page
  async buscarPorSlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string
      const barbearia = await barbeariaService.buscarPorSlug(slug)
      res.json(barbearia)
    } catch (err) {
      next(err)
    }
  },

  // rota autenticada — admin busca os dados da própria barbearia
  async buscarPropria(req: Request, res: Response, next: NextFunction) {
    try {
      const barbearia = await barbeariaService.buscarPorId(req.barbeariaId!)
      res.json(barbearia)
    } catch (err) {
      next(err)
    }
  },

  // rota autenticada — admin atualiza configurações da própria barbearia
  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const dados = schemaAtualizarBarbearia.parse(req.body)
      const barbearia = await barbeariaService.atualizar(req.barbeariaId!, dados)
      res.json(barbearia)
    } catch (err) {
      next(err)
    }
  },
}
