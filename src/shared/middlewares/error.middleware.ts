import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export class ErroAplicacao extends Error {
  constructor(
    public mensagem: string,
    public statusCode: number = 400
  ) {
    super(mensagem)
    this.name = 'ErroAplicacao'
  }
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      mensagem: 'Dados inválidos.',
      erros: err.issues.map((e) => ({
        campo: e.path.join('.'),
        mensagem: e.message,
      })),
    })
    return
  }

  if (err instanceof ErroAplicacao) {
    res.status(err.statusCode).json({ mensagem: err.mensagem })
    return
  }

  console.error(err)
  res.status(500).json({ mensagem: 'Erro interno do servidor.' })
}