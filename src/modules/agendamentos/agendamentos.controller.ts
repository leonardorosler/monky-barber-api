import { Request, Response, NextFunction } from 'express'
import { agendamentosService } from './agendamentos.service'
import {
  schemaCriarAgendamento,
  schemaAtualizarStatus,
  schemaHorariosDisponiveis,
} from './agendamentos.validator'

export const agendamentosController = {
  // cliente cria agendamento
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const dados = schemaCriarAgendamento.parse(req.body)
      const agendamento = await agendamentosService.criar(
        req.barbeariaId!,
        req.usuario!.id,
        dados
      )
      res.status(201).json(agendamento)
    } catch (err) {
      next(err)
    }
  },

  // admin lista todos os agendamentos da barbearia
  async listarPorBarbearia(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.query.data ? new Date(req.query.data as string) : undefined
      const status = req.query.status as string | undefined

      const agendamentos = await agendamentosService.listarPorBarbearia(
        req.barbeariaId!,
        { data, status }
      )
      res.json(agendamentos)
    } catch (err) {
      next(err)
    }
  },

  // cliente lista os próprios agendamentos
  async listarPorCliente(req: Request, res: Response, next: NextFunction) {
    try {
      const agendamentos = await agendamentosService.listarPorCliente(req.usuario!.id)
      res.json(agendamentos)
    } catch (err) {
      next(err)
    }
  },

  // barbeiro lista sua própria agenda
  async listarPorBarbeiro(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.query.data ? new Date(req.query.data as string) : undefined
      const agendamentos = await agendamentosService.listarPorBarbeiro(
        req.usuario!.id,
        req.barbeariaId!,
        data
      )
      res.json(agendamentos)
    } catch (err) {
      next(err)
    }
  },

  async buscarPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const agendamento = await agendamentosService.buscarPorId(id, req.barbeariaId!)
      res.json(agendamento)
    } catch (err) {
      next(err)
    }
  },

  async atualizarStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const dados = schemaAtualizarStatus.parse(req.body)
      const agendamento = await agendamentosService.atualizarStatus(
        id,
        req.barbeariaId!,
        dados,
        req.usuario!.id,
        req.usuario!.papel
      )
      res.json(agendamento)
    } catch (err) {
      next(err)
    }
  },

  // retorna os horários disponíveis para um barbeiro/serviço/data
  async horariosDisponiveis(req: Request, res: Response, next: NextFunction) {
    try {
      const dados = schemaHorariosDisponiveis.parse(req.query)
      const resultado = await agendamentosService.horariosDisponiveis(
        req.barbeariaId!,
        dados
      )
      res.json(resultado)
    } catch (err) {
      next(err)
    }
  },
}
