import nodemailer from 'nodemailer'

type ResetPasswordEmailInput = {
  to: string
  nome: string
  token: string
}

const smtpPort = Number(process.env.SMTP_PORT || 587)
const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465

function getFrontendUrl() {
  const explicitResetUrl = process.env.RESET_PASSWORD_URL?.trim()
  if (explicitResetUrl) return explicitResetUrl

  const firstFrontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean)[0]

  return `${firstFrontendUrl.replace(/\/$/, '')}/redefinir-senha`
}

function buildResetPasswordUrl(token: string) {
  const url = new URL(getFrontendUrl())
  url.searchParams.set('token', token)
  return url.toString()
}

function hasSmtpConfig() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.EMAIL_FROM
  )
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function enviarEmailRedefinicaoSenha({
  to,
  nome,
  token,
}: ResetPasswordEmailInput) {
  const resetUrl = buildResetPasswordUrl(token)
  const safeNome = escapeHtml(nome)

  if (!hasSmtpConfig()) {
    console.warn(
      `[EMAIL] SMTP nao configurado. Link de redefinicao para ${to}: ${resetUrl}`
    )
    return
  }

  const transporter = createTransporter()

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Redefinicao de senha - Barbearia King',
    text: [
      `Ola, ${nome}.`,
      '',
      'Recebemos uma solicitacao para redefinir sua senha.',
      `Acesse o link abaixo para criar uma nova senha: ${resetUrl}`,
      '',
      'Este link expira em 1 hora. Se voce nao solicitou a redefinicao, ignore este e-mail.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
        <h2 style="margin: 0 0 16px;">Redefinicao de senha</h2>
        <p>Ola, ${safeNome}.</p>
        <p>Recebemos uma solicitacao para redefinir sua senha.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 18px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 8px;">
            Criar nova senha
          </a>
        </p>
        <p>Este link expira em 1 hora.</p>
        <p>Se voce nao solicitou a redefinicao, ignore este e-mail.</p>
      </div>
    `,
  })
}
