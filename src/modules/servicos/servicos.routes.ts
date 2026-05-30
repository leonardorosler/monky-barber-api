import { Router } from 'express'
import { servicosController } from './servicos.controller'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { autenticar, autorizar } from '../auth/auth.middleware'

const servicosRoutes = Router()

servicosRoutes.use(tenantMiddleware)

// públicas — landing page exibe serviços sem login
servicosRoutes.get('/', servicosController.listar)
servicosRoutes.get('/:id', servicosController.buscarPorId)

// apenas admin
servicosRoutes.post('/', autenticar, autorizar('ADMIN'), servicosController.criar)
servicosRoutes.patch('/:id', autenticar, autorizar('ADMIN'), servicosController.atualizar)

export default servicosRoutes
