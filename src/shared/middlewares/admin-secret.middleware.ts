import { Request, Response, NextFunction } from 'express'

export function adminSecretMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const secret = req.headers['x-admin-secret']

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    res.status(401).json({ mensagem: 'Não autorizado.' })
    return
  }

  next()
}