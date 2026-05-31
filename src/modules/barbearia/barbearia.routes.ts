import { Router } from 'express'
import { barbeariaController } from './barbearia.controller'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { autenticar, autorizar } from '../auth/auth.middleware'
import { adminSecretMiddleware } from '../../shared/middlewares/admin-secret.middleware'

const barbeariaRoutes = Router()

// protegida — apenas quem tem o ADMIN_SECRET pode criar uma barbearia
barbeariaRoutes.post('/', adminSecretMiddleware, barbeariaController.criar)
barbeariaRoutes.get('/slug/:slug', barbeariaController.buscarPorSlug)

// autenticadas — exigem tenant + token
barbeariaRoutes.get('/', tenantMiddleware, autenticar, barbeariaController.buscarPropria)
barbeariaRoutes.patch('/', tenantMiddleware, autenticar, autorizar('ADMIN'), barbeariaController.atualizar)

export default barbeariaRoutes