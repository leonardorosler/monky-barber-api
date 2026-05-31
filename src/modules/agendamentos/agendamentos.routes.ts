import { Router } from 'express'
import { agendamentosController } from './agendamentos.controller'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { autenticar, autorizar } from '../auth/auth.middleware'

const agendamentosRoutes = Router()

agendamentosRoutes.use(tenantMiddleware)
agendamentosRoutes.use(autenticar)

// horários disponíveis — público dentro do tenant (fluxo de agendamento sem login)
agendamentosRoutes.get('/horarios-disponiveis', agendamentosController.horariosDisponiveis)

// cliente
agendamentosRoutes.post('/', autorizar('CLIENTE'), agendamentosController.criar)
agendamentosRoutes.get('/meus', autorizar('CLIENTE'), agendamentosController.listarPorCliente)

// barbeiro
agendamentosRoutes.get('/agenda', autorizar('BARBEIRO'), agendamentosController.listarPorBarbeiro)

// admin
agendamentosRoutes.get('/', autorizar('ADMIN'), agendamentosController.listarPorBarbearia)

// qualquer autenticado pode ver e atualizar status (service valida permissão por papel)
agendamentosRoutes.get('/:id', agendamentosController.buscarPorId)
agendamentosRoutes.patch('/:id/status', agendamentosController.atualizarStatus)

export default agendamentosRoutes
