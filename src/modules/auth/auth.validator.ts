import { z } from 'zod'

export const schemaCadastro = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('E-mail inválido.'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres.'),
  telefone: z.string().optional(),
})

export const schemaLogin = z.object({
  email: z.string().email('E-mail inválido.'),
  senha: z.string().min(1, 'Senha obrigatória.'),
})

export const schemaRefreshToken = z.object({
  refreshToken: z.string().min(1, 'Refresh token obrigatório.'),
})

export const schemaEsqueceuSenha = z.object({
  email: z.string().email('E-mail inválido.'),
})

export const schemaRedefinirSenha = z.object({
  token: z.string().min(1, 'Token obrigatório.'),
  novaSenha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres.'),
})

export type CadastroDTO = z.infer<typeof schemaCadastro>
export type LoginDTO = z.infer<typeof schemaLogin>
export type RefreshTokenDTO = z.infer<typeof schemaRefreshToken>
export type EsqueceuSenhaDTO = z.infer<typeof schemaEsqueceuSenha>
export type RedefinirSenhaDTO = z.infer<typeof schemaRedefinirSenha>
