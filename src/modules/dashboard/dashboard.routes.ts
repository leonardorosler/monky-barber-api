import { Router, Request, Response, NextFunction } from 'express'
import { dashboardService } from './dashboard.service'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { autenticar, autorizar } from '../auth/auth.middleware'

const dashboardRoutes = Router()

dashboardRoutes.use(tenantMiddleware)
dashboardRoutes.use(autenticar)
dashboardRoutes.use(autorizar('ADMIN'))

dashboardRoutes.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resumo = await dashboardService.resumo(req.barbeariaId!)
    res.json(resumo)
  } catch (err) {
    next(err)
  }
})

export default dashboardRoutes
