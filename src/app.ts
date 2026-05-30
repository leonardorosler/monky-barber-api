import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { errorMiddleware } from './shared/middlewares/error.middleware'
import authRoutes from './modules/auth/auth.routes'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

// health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/auth', authRoutes) 

// rotas serão registradas aqui conforme os módulos forem criados
// ex: app.use('/auth', authRoutes)

app.use(errorMiddleware)

export default app