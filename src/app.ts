import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { errorMiddleware } from './shared/middlewares/error.middleware'
import authRoutes from './modules/auth/auth.routes'
import barbeariaRoutes from './modules/barbearia/barbearia.routes'
import barbeirosRoutes from './modules/barbeiros/barbeiros.routes'
import servicosRoutes from './modules/servicos/servicos.routes'
import disponibilidadeRoutes from './modules/disponibilidade/disponibilidade.routes'
import folgasRoutes from './modules/folgas/folgas.routes'
import bloqueiosRoutes from './modules/bloqueios/bloqueios.routes'
import clientesRoutes from './modules/clientes/clientes.routes'
import planosRoutes from './modules/planos/planos.routes'
import agendamentosRoutes from './modules/agendamentos/agendamentos.routes'
import assinaturasRoutes from './modules/assinaturas/assinaturas.routes'
import pagamentosRoutes from './modules/pagamentos/pagamentos.routes'
import dashboardRoutes from './modules/dashboard/dashboard.routes'

const app = express()

app.use(helmet())
app.use(cors())

// webhook precisa do raw body — deve vir antes do express.json()
app.use('/pagamentos/webhook', express.raw({ type: 'application/json' }))

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/auth', authRoutes)
app.use('/barbearia', barbeariaRoutes)
app.use('/barbeiros', barbeirosRoutes)
app.use('/servicos', servicosRoutes)
app.use('/disponibilidade', disponibilidadeRoutes)
app.use('/folgas', folgasRoutes)
app.use('/bloqueios', bloqueiosRoutes)
app.use('/clientes', clientesRoutes)
app.use('/planos', planosRoutes)
app.use('/agendamentos', agendamentosRoutes)
app.use('/assinaturas', assinaturasRoutes)
app.use('/pagamentos', pagamentosRoutes)
app.use('/dashboard', dashboardRoutes)

app.use(errorMiddleware)

export default app