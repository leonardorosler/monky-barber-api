import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { errorMiddleware } from './shared/middlewares/error.middleware'
import authRoutes from './modules/auth/auth.routes'
import barbeariaRoutes from './modules/barbearia/barbearia.routes'
import barbeirosRoutes from './modules/barbeiros/barbeiros.routes'
import servicosRoutes from './modules/servicos/servicos.routes'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/auth', authRoutes)
app.use('/barbearia', barbeariaRoutes)
app.use('/barbeiros', barbeirosRoutes)
app.use('/servicos', servicosRoutes)

app.use(errorMiddleware)

export default appgit 