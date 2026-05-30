import { Router } from 'express'
import { barbeariaController } from './barbearia.controller'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { autenticar, autorizar } from '../auth/auth.middleware'

const barbeariaRoutes = Router()

// pública — sem tenant, usada pelo frontend pra resolver o slug
barbeariaRoutes.post('/', barbeariaController.criar)
barbeariaRoutes.get('/slug/:slug', barbeariaController.buscarPorSlug)

// autenticadas — exigem tenant + token
barbeariaRoutes.get('/', tenantMiddleware, autenticar, barbeariaController.buscarPropria)
barbeariaRoutes.patch('/', tenantMiddleware, autenticar, autorizar('ADMIN'), barbeariaController.atualizar)

export default barbeariaRoutes
