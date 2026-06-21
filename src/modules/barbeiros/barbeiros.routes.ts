import { Router } from 'express'
import { barbeirosController } from './barbeiros.controller'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { autenticar, autorizar } from '../auth/auth.middleware'

const barbeirosRoutes = Router()

barbeirosRoutes.use(tenantMiddleware)

// pública dentro do tenant — clientes veem os barbeiros pra agendar
barbeirosRoutes.get('/', barbeirosController.listar)
barbeirosRoutes.get('/me', autenticar, autorizar('BARBEIRO', 'ADMIN'), barbeirosController.me)
barbeirosRoutes.get('/:id', barbeirosController.buscarPorId)
barbeirosRoutes.patch('/me', autenticar, autorizar('BARBEIRO', 'ADMIN'), barbeirosController.atualizarMe)

// apenas admin
barbeirosRoutes.post('/', autenticar, autorizar('ADMIN'), barbeirosController.criar)
barbeirosRoutes.patch('/:id', autenticar, autorizar('ADMIN'), barbeirosController.atualizar)

export default barbeirosRoutes
