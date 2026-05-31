import { Router } from 'express'
import { bloqueiosController } from './bloqueios.controller'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { autenticar, autorizar } from '../auth/auth.middleware'

const bloqueiosRoutes = Router()

bloqueiosRoutes.use(tenantMiddleware)
bloqueiosRoutes.use(autenticar)

bloqueiosRoutes.get('/:barbeiroId', bloqueiosController.listar)
bloqueiosRoutes.post('/:barbeiroId', autorizar('ADMIN', 'BARBEIRO'), bloqueiosController.criar)
bloqueiosRoutes.delete('/:barbeiroId/:id', autorizar('ADMIN', 'BARBEIRO'), bloqueiosController.deletar)

export default bloqueiosRoutes
