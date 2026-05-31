import { Router } from 'express'
import { clientesController } from './clientes.controller'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { autenticar, autorizar } from '../auth/auth.middleware'

const clientesRoutes = Router()

clientesRoutes.use(tenantMiddleware)
clientesRoutes.use(autenticar)

// cliente gerencia o próprio perfil
clientesRoutes.get('/perfil', clientesController.buscarPerfil)
clientesRoutes.patch('/perfil', clientesController.atualizarPerfil)

// admin gerencia clientes da barbearia
clientesRoutes.get('/', autorizar('ADMIN'), clientesController.listar)
clientesRoutes.get('/:id', autorizar('ADMIN'), clientesController.buscarPorId)
clientesRoutes.patch('/:id', autorizar('ADMIN'), clientesController.atualizar)

export default clientesRoutes
