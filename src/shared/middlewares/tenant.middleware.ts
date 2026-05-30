import { Request, Response, NextFunction } from 'express'
import prisma from '../lib/prisma'

export async function tenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const barbeariaId =
    (req.headers['x-barbearia-id'] as string) || req.query.barbeariaId as string

  if (!barbeariaId) {
    res.status(400).json({ mensagem: 'Identificador da barbearia não informado.' })
    return
  }

  const barbearia = await prisma.barbearia.findUnique({
    where: { id: barbeariaId },
    select: { id: true },
  })

  if (!barbearia) {
    res.status(404).json({ mensagem: 'Barbearia não encontrada.' })
    return
  }

  req.barbeariaId = barbeariaId
  next()
}