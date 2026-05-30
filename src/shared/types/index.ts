import { Papel } from '@prisma/client'

export interface UsuarioAutenticado {
  id: string
  barbeariaId: string
  papel: Papel
}

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioAutenticado
      barbeariaId?: string
    }
  }
}