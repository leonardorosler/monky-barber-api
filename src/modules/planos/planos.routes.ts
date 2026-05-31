import { Router } from 'express'
import { planosController } from './planos.controller'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { autenticar, autorizar } from '../auth/auth.middleware'

const planosRoutes = Router()

planosRoutes.use(tenantMiddleware)

// públicas — landing page exibe planos
planosRoutes.get('/', planosController.listar)
planosRoutes.get('/:id', planosController.buscarPorId)

// apenas admin
planosRoutes.post('/', autenticar, autorizar('ADMIN'), planosController.criar)
planosRoutes.patch('/:id', autenticar, autorizar('ADMIN'), planosController.atualizar)

export default planosRoutes
