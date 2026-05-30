import { Router } from 'express'
import { authController } from './auth.controller'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'

const authRoutes = Router()

// todas as rotas de auth precisam do tenant
authRoutes.use(tenantMiddleware)

authRoutes.post('/cadastro', authController.cadastrar)
authRoutes.post('/login', authController.login)
authRoutes.post('/refresh', authController.renovarToken)
authRoutes.post('/logout', authController.logout)
authRoutes.post('/esqueceu-senha', authController.esqueceuSenha)
authRoutes.post('/redefinir-senha', authController.redefinirSenha)

export default authRoutes
