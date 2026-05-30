import { Router } from 'express'
import { folgasController } from './folgas.controller'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { autenticar, autorizar } from '../auth/auth.middleware'

const folgasRoutes = Router()

folgasRoutes.use(tenantMiddleware)
folgasRoutes.use(autenticar)

folgasRoutes.get('/:barbeiroId', folgasController.listar)
folgasRoutes.post('/:barbeiroId', autorizar('ADMIN', 'BARBEIRO'), folgasController.criar)
folgasRoutes.delete('/:barbeiroId/:id', autorizar('ADMIN', 'BARBEIRO'), folgasController.deletar)

export default folgasRoutes
