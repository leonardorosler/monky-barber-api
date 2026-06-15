import { Router, Request, Response, NextFunction } from 'express'
import prisma from '../../shared/lib/prisma'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { autenticar, autorizar } from '../auth/auth.middleware'
import { assinaturasRepository } from '../assinaturas/assinaturas.repository'

// ─────────────────────────────────────────────
// HELPERS MERCADO PAGO
// ─────────────────────────────────────────────

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN as string
const MP_API = 'https://api.mercadopago.com'

async function criarPreferencia(dados: {
  titulo: string
  valor: number
  referencia: string
  pagadorEmail: string
}) {
  const response = await fetch(`${MP_API}/checkout/preferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      items: [
        {
          title: dados.titulo,
          quantity: 1,
          unit_price: dados.valor,
          currency_id: 'BRL',
        },
      ],
      payer: { email: dados.pagadorEmail },
      external_reference: dados.referencia,
      back_urls: {
        success: `${process.env.FRONTEND_URL}/pagamento/sucesso`,
        failure: `${process.env.FRONTEND_URL}/pagamento/falha`,
      },
      auto_return: 'approved',
    }),
  })

  return response.json()
}

// ─────────────────────────────────────────────
// ROTAS
// ─────────────────────────────────────────────

const pagamentosRoutes = Router()

// gera link de pagamento para agendamento avulso
pagamentosRoutes.post(
  '/agendamento/:agendamentoId',
  tenantMiddleware,
  autenticar,
  autorizar('CLIENTE'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const agendamentoId = req.params.agendamentoId as string

      const agendamento = await prisma.agendamento.findFirst({
        where: { id: agendamentoId, barbeariaId: req.barbeariaId! },
        include: {
          servico: true,
          cliente: { include: { usuario: { select: { email: true } } } },
        },
      })

      if (!agendamento) {
        res.status(404).json({ mensagem: 'Agendamento não encontrado.' })
        return
      }

      const preferencia = await criarPreferencia({
        titulo: agendamento.servico.nome,
        valor: Number(agendamento.servico.preco),
        referencia: agendamento.id,
        pagadorEmail: agendamento.cliente.usuario.email,
      })

      await prisma.pagamento.create({
        data: {
          barbeariaId: req.barbeariaId!,
          agendamentoId: agendamento.id,
          valor: agendamento.servico.preco,
          metodo: 'PIX',
          status: 'PENDENTE',
          mpPagamentoId: preferencia.id,
        },
      })

      res.json({ linkPagamento: preferencia.init_point, preferenciaId: preferencia.id })
    } catch (err) {
      next(err)
    }
  }
)

// gera link de pagamento para assinatura
pagamentosRoutes.post(
  '/assinatura/:assinaturaId',
  tenantMiddleware,
  autenticar,
  autorizar('CLIENTE'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assinaturaId = req.params.assinaturaId as string

      const assinatura = await prisma.assinatura.findFirst({
        where: { id: assinaturaId },
        include: {
          plano: true,
          cliente: { include: { usuario: { select: { email: true, id: true } } } },
        },
      })

      if (!assinatura) {
        res.status(404).json({ mensagem: 'Assinatura não encontrada.' })
        return
      }

      // valida que o cliente autenticado é o dono da assinatura
      if (assinatura.cliente.usuarioId !== req.usuario!.id) {
        res.status(403).json({ mensagem: 'Acesso negado.' })
        return
      }

      const preferencia = await criarPreferencia({
        titulo: `Assinatura — ${assinatura.plano.nome}`,
        valor: Number(assinatura.plano.preco),
        referencia: assinatura.id,
        pagadorEmail: assinatura.cliente.usuario.email,
      })

      await prisma.pagamento.create({
        data: {
          barbeariaId: req.barbeariaId!,
          assinaturaId: assinatura.id,
          valor: assinatura.plano.preco,
          metodo: 'PIX',
          status: 'PENDENTE',
          mpPagamentoId: preferencia.id,
        },
      })

      res.json({ linkPagamento: preferencia.init_point, preferenciaId: preferencia.id })
    } catch (err) {
      next(err)
    }
  }
)

// lista pagamentos da barbearia
pagamentosRoutes.get(
  '/',
  tenantMiddleware,
  autenticar,
  autorizar('ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pagamentos = await prisma.pagamento.findMany({
        where: { barbeariaId: req.barbeariaId! },
        include: {
          agendamento: {
            include: {
              servico: true,
              cliente: { include: { usuario: { select: { nome: true } } } },
            },
          },
          assinatura: { include: { plano: true } },
        },
        orderBy: { criadoEm: 'desc' },
      })
      res.json(pagamentos)
    } catch (err) {
      next(err)
    }
  }
)

// ─────────────────────────────────────────────
// WEBHOOK MERCADO PAGO
// ─────────────────────────────────────────────

pagamentosRoutes.post('/webhook', async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body

    if (type === 'payment') {
      const mpPagamentoId = data.id

      const mpResponse = await fetch(`${MP_API}/v1/payments/${mpPagamentoId}`, {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      })
      const mpPagamento = await mpResponse.json()

      const status = mpPagamento.status
      const referencia = mpPagamento.external_reference

      const statusMap: Record<string, string> = {
        approved: 'APROVADO',
        rejected: 'RECUSADO',
        cancelled: 'CANCELADO',
        refunded: 'REEMBOLSADO',
      }

      const novoStatus = statusMap[status]
      if (!novoStatus) {
        res.sendStatus(200)
        return
      }

      // tenta encontrar pagamento por agendamento
      const pagamentoPorAgendamento = await prisma.pagamento.findFirst({
        where: { agendamentoId: referencia },
      })

      if (pagamentoPorAgendamento) {
        await prisma.pagamento.update({
          where: { id: pagamentoPorAgendamento.id },
          data: { status: novoStatus as any, mpPagamentoId: String(mpPagamentoId) },
        })

        if (novoStatus === 'APROVADO') {
          await prisma.agendamento.update({
            where: { id: referencia },
            data: { status: 'CONFIRMADO' },
          })
        }
      }

      // tenta encontrar pagamento por assinatura
      const pagamentoPorAssinatura = await prisma.pagamento.findFirst({
        where: { assinaturaId: referencia },
      })

      if (pagamentoPorAssinatura) {
        await prisma.pagamento.update({
          where: { id: pagamentoPorAssinatura.id },
          data: { status: novoStatus as any, mpPagamentoId: String(mpPagamentoId) },
        })

        if (novoStatus === 'APROVADO') {
          await prisma.assinatura.update({
            where: { id: referencia },
            data: { status: 'ATIVA' },
          })
        }
      }
    }

    if (type === 'subscription_preapproval') {
      const mpAssinaturaId = data.id

      const mpResponse = await fetch(`${MP_API}/preapproval/${mpAssinaturaId}`, {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      })
      const mpAssinatura = await mpResponse.json()

      const statusMap: Record<string, string> = {
        authorized: 'ATIVA',
        paused: 'INADIMPLENTE',
        cancelled: 'CANCELADA',
      }

      const novoStatus = statusMap[mpAssinatura.status]
      if (!novoStatus) {
        res.sendStatus(200)
        return
      }

      await assinaturasRepository.atualizarStatus(
        mpAssinatura.external_reference,
        novoStatus,
        mpAssinaturaId
      )
    }

    res.sendStatus(200)
  } catch (err) {
    console.error('[Webhook MP]', err)
    res.sendStatus(200)
  }
})

export default pagamentosRoutes