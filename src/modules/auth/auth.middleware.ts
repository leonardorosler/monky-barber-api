import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { Papel } from '@prisma/client'
import { UsuarioAutenticado } from '../../shared/types'

const JWT_SECRET = process.env.JWT_SECRET as string

export function autenticar(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ mensagem: 'Token não informado.' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, JWT_SECRET) as UsuarioAutenticado
    req.usuario = payload
    next()
  } catch {
    res.status(401).json({ mensagem: 'Token inválido ou expirado.' })
  }
}

export function autorizar(...papeis: Papel[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({ mensagem: 'Não autenticado.' })
      return
    }

    if (!papeis.includes(req.usuario.papel)) {
      res.status(403).json({ mensagem: 'Acesso negado.' })
      return
    }

    next()
  }
}
