import { Router } from 'express'
import { barbeirosController } from './barbeiros.controller'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { autenticar, autorizar } from '../auth/auth.middleware'

const barbeirosRoutes = Router()

barbeirosRoutes.use(tenantMiddleware)
barbeirosRoutes.use(autenticar)

// pública dentro do tenant — clientes veem os barbeiros pra agendar
barbeirosRoutes.get('/', barbeirosController.listar)
barbeirosRoutes.get('/:id', barbeirosController.buscarPorId)

// apenas admin
barbeirosRoutes.post('/', autorizar('ADMIN'), barbeirosController.criar)
barbeirosRoutes.patch('/:id', autorizar('ADMIN'), barbeirosController.atualizar)

export default barbeirosRoutes
