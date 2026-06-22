import { assinaturasRepository } from './assinaturas.repository'
import { planosRepository } from '../planos/planos.repository'
import { clientesRepository } from '../clientes/clientes.repository'
import { ErroAplicacao } from '../../shared/middlewares/error.middleware'
import { businessMonthRange } from '../../shared/utils/date.utils'
import type { CriarAssinaturaDTO, AtribuirAssinaturaDTO, AtualizarStatusAssinaturaDTO } from './assinaturas.validator'

function periodoMensalAtual() {
  return businessMonthRange(new Date())
}

export const assinaturasService = {
  async criar(barbeariaId: string, usuarioId: string, dados: CriarAssinaturaDTO) {
    const cliente = await clientesRepository.buscarPorUsuarioId(usuarioId)
    if (!cliente) {
      throw new ErroAplicacao('Perfil de cliente não encontrado.', 404)
    }

    const plano = await planosRepository.buscarPorId(dados.planoId, barbeariaId)
    if (!plano) {
      throw new ErroAplicacao('Plano não encontrado.', 404)
    }
    if (!plano.ativo) {
      throw new ErroAplicacao('Plano inativo.', 409)
    }

    const jaAssinou = await assinaturasRepository.assinaturaAtivaDoCliente(
      cliente.id,
      dados.planoId
    )
    if (jaAssinou) {
      throw new ErroAplicacao('Você já possui uma assinatura ativa neste plano.', 409)
    }

    return assinaturasRepository.criar({
      clienteId: cliente.id,
      planoId: dados.planoId,
      inicio: new Date(),
    })
  },

  async atribuir(barbeariaId: string, dados: AtribuirAssinaturaDTO) {
    const cliente = await clientesRepository.buscarPorId(dados.clienteId, barbeariaId)
    if (!cliente) {
      throw new ErroAplicacao('Cliente não encontrado.', 404)
    }

    const plano = await planosRepository.buscarPorId(dados.planoId, barbeariaId)
    if (!plano) {
      throw new ErroAplicacao('Plano não encontrado.', 404)
    }
    if (!plano.ativo) {
      throw new ErroAplicacao('Plano inativo.', 409)
    }

    const assinaturaAtiva = await assinaturasRepository.assinaturaAtivaPorCliente(cliente.id)
    if (assinaturaAtiva?.planoId === plano.id) {
      return assinaturasRepository.buscarPorId(assinaturaAtiva.id)
    }

    if (assinaturaAtiva) {
      await assinaturasRepository.atualizarStatus(assinaturaAtiva.id, 'CANCELADA')
    }

    return assinaturasRepository.criar({
      clienteId: cliente.id,
      planoId: dados.planoId,
      inicio: new Date(),
    })
  },

  async listarPorBarbearia(barbeariaId: string) {
    return assinaturasRepository.listarPorBarbearia(barbeariaId)
  },

  async listarPorCliente(usuarioId: string) {
    const cliente = await clientesRepository.buscarPorUsuarioId(usuarioId)
    if (!cliente) {
      throw new ErroAplicacao('Perfil de cliente não encontrado.', 404)
    }
    return assinaturasRepository.listarPorCliente(cliente.id)
  },

  async utilizacaoPorClienteId(clienteId: string) {
    const assinatura = await assinaturasRepository.assinaturaAtivaPorCliente(clienteId)
    if (!assinatura) return null

    const periodo = periodoMensalAtual()
    const agendamentos = await assinaturasRepository.listarAgendamentosDoPlano(
      clienteId,
      periodo.inicio,
      periodo.fim
    )

    const servicos = assinatura.plano.planosServicos.map((planoServico) => {
      const agendamentosDoServico = agendamentos.filter(
        (agendamento) =>
          agendamento.servicoId === planoServico.servicoId &&
          agendamento.assinaturaId === assinatura.id
      )
      const usados = agendamentosDoServico.filter((agendamento) => agendamento.status === 'CONCLUIDO').length
      const reservados = agendamentosDoServico.filter((agendamento) => ['PENDENTE', 'CONFIRMADO'].includes(agendamento.status)).length
      const consumidos = usados + reservados

      return {
        assinaturaId: assinatura.id,
        servicoId: planoServico.servicoId,
        nome: planoServico.servico.nome,
        duracao: planoServico.servico.duracao,
        limite: planoServico.quantidade,
        usados,
        reservados,
        disponiveis: Math.max(planoServico.quantidade - consumidos, 0),
        cobertoPeloPlano: true,
      }
    })

    return {
      assinaturaId: assinatura.id,
      plano: {
        id: assinatura.plano.id,
        nome: assinatura.plano.nome,
      },
      status: assinatura.status,
      periodo: {
        inicio: periodo.inicio.toISOString(),
        fim: periodo.fim.toISOString(),
      },
      servicos,
    }
  },

  async utilizacao(usuarioId: string) {
    const cliente = await clientesRepository.buscarPorUsuarioId(usuarioId)
    if (!cliente) {
      throw new ErroAplicacao('Perfil de cliente não encontrado.', 404)
    }

    return assinaturasService.utilizacaoPorClienteId(cliente.id)
  },

  async buscarPorId(id: string) {
    const assinatura = await assinaturasRepository.buscarPorId(id)
    if (!assinatura) {
      throw new ErroAplicacao('Assinatura não encontrada.', 404)
    }
    return assinatura
  },

  async cancelar(id: string, usuarioId: string, papel: string) {
    const assinatura = await assinaturasService.buscarPorId(id)

    if (papel === 'CLIENTE') {
      const cliente = await clientesRepository.buscarPorUsuarioId(usuarioId)
      if (!cliente || assinatura.clienteId !== cliente.id) {
        throw new ErroAplicacao('Acesso negado.', 403)
      }
    }

    if (assinatura.status !== 'ATIVA') {
      throw new ErroAplicacao('Apenas assinaturas ativas podem ser canceladas.', 409)
    }

    return assinaturasRepository.atualizarStatus(id, 'CANCELADA')
  },

  async atualizarStatus(id: string, dados: AtualizarStatusAssinaturaDTO) {
    await assinaturasService.buscarPorId(id)
    return assinaturasRepository.atualizarStatus(id, dados.status)
  },
}
