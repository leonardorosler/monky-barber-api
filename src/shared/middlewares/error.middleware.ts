import { Request, Response, NextFunction } from 'express'

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
  if (err instanceof ErroAplicacao) {
    res.status(err.statusCode).json({ mensagem: err.mensagem })
    return
  }

  console.error(err)
  res.status(500).json({ mensagem: 'Erro interno do servidor.' })
}