import { Request } from 'express'

export function pegarParam(req: Request, param: string): string {
  const valor = req.params[param]
  return Array.isArray(valor) ? valor[0] : valor
}