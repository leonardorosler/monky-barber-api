import { Router } from 'express'
import { assinaturasController } from './assinaturas.controller'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { autenticar, autorizar } from '../auth/auth.middleware'

const assinaturasRoutes = Router()

assinaturasRoutes.use(tenantMiddleware)
assinaturasRoutes.use(autenticar)

// cliente
assinaturasRoutes.post('/', autorizar('CLIENTE'), assinaturasController.criar)
assinaturasRoutes.get('/minhas', autorizar('CLIENTE'), assinaturasController.listarPorCliente)
assinaturasRoutes.patch('/:id/cancelar', assinaturasController.cancelar)

// admin
assinaturasRoutes.get('/', autorizar('ADMIN'), assinaturasController.listarPorBarbearia)
assinaturasRoutes.get('/:id', autorizar('ADMIN'), assinaturasController.buscarPorId)
assinaturasRoutes.patch('/:id/status', autorizar('ADMIN'), assinaturasController.atualizarStatus)

export default assinaturasRoutes
