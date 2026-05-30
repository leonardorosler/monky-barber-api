import { Router } from 'express'
import { disponibilidadeController } from './disponibilidade.controller'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { autenticar, autorizar } from '../auth/auth.middleware'

const disponibilidadeRoutes = Router()

disponibilidadeRoutes.use(tenantMiddleware)
disponibilidadeRoutes.use(autenticar)

// qualquer autenticado pode ver a disponibilidade de um barbeiro
disponibilidadeRoutes.get('/:barbeiroId', disponibilidadeController.listar)

// admin ou o próprio barbeiro podem definir
disponibilidadeRoutes.put('/:barbeiroId', autorizar('ADMIN', 'BARBEIRO'), disponibilidadeController.definir)

export default disponibilidadeRoutes
