import { agendamentosRepository } from './agendamentos.repository'
import { barbeirosRepository } from '../barbeiros/barbeiros.repository'
import { servicosRepository } from '../servicos/servicos.repository'
import { clientesRepository } from '../clientes/clientes.repository'
import { validarHorarioAgendamento, gerarHorariosDisponiveis } from './agendamentos.helpers'
import { ErroAplicacao } from '../../shared/middlewares/error.middleware'
import type {
  CriarAgendamentoDTO,
  AtualizarStatusDTO,
  HorariosDisponiveisDTO,
} from './agendamentos.validator'

export const agendamentosService = {
  async criar(barbeariaId: string, usuarioId: string, dados: CriarAgendamentoDTO) {
    // busca o cliente pelo usuarioId
    const cliente = await clientesRepository.buscarPorUsuarioId(usuarioId)
    if (!cliente) {
      throw new ErroAplicacao('Perfil de cliente não encontrado.', 404)
    }

    // valida barbeiro
    const barbeiro = await barbeirosRepository.buscarPorId(dados.barbeiroId, barbeariaId)
    if (!barbeiro) {
      throw new ErroAplicacao('Barbeiro não encontrado.', 404)
    }
    if (!barbeiro.ativo) {
      throw new ErroAplicacao('Barbeiro inativo.', 409)
    }

    // valida serviço
    const servico = await servicosRepository.buscarPorId(dados.servicoId, barbeariaId)
    if (!servico) {
      throw new ErroAplicacao('Serviço não encontrado.', 404)
    }
    if (!servico.ativo) {
      throw new ErroAplicacao('Serviço inativo.', 409)
    }

    if (dados.inicio < new Date()) {
      throw new ErroAplicacao('Não é possível agendar em horários no passado.', 400)
    }

    // calcula fim com base na duração do serviço
    const fim = new Date(dados.inicio)
    fim.setMinutes(fim.getMinutes() + servico.duracao)

    // valida todas as regras de horário
    await validarHorarioAgendamento(dados.barbeiroId, dados.inicio, fim)

    return agendamentosRepository.criar({
      barbeariaId,
      clienteId: cliente.id,
      barbeiroId: dados.barbeiroId,
      servicoId: dados.servicoId,
      inicio: dados.inicio,
      fim,
    })
  },

  async listarPorBarbearia(
    barbeariaId: string,
    filtros?: { data?: Date; status?: string }
  ) {
    return agendamentosRepository.listarPorBarbearia(barbeariaId, filtros)
  },

  async listarPorCliente(usuarioId: string) {
    const cliente = await clientesRepository.buscarPorUsuarioId(usuarioId)
    if (!cliente) {
      throw new ErroAplicacao('Perfil de cliente não encontrado.', 404)
    }
    return agendamentosRepository.listarPorCliente(cliente.id)
  },

  async listarPorBarbeiro(usuarioId: string, barbeariaId: string, data?: Date) {
    const barbeiro = await barbeirosRepository.buscarPorUsuarioId(usuarioId)
    if (!barbeiro || barbeiro.barbeariaId !== barbeariaId) {
      throw new ErroAplicacao('Barbeiro não encontrado.', 404)
    }
    return agendamentosRepository.listarPorBarbeiro(barbeiro.id, data)
  },

  async buscarPorId(id: string, barbeariaId: string) {
    const agendamento = await agendamentosRepository.buscarPorId(id, barbeariaId)
    if (!agendamento) {
      throw new ErroAplicacao('Agendamento não encontrado.', 404)
    }
    return agendamento
  },

  async atualizarStatus(
    id: string,
    barbeariaId: string,
    dados: AtualizarStatusDTO,
    usuarioId: string,
    papel: string
  ) {
    const agendamento = await agendamentosService.buscarPorId(id, barbeariaId)

    // cliente só pode cancelar o próprio agendamento
    if (papel === 'CLIENTE') {
      const cliente = await clientesRepository.buscarPorUsuarioId(usuarioId)
      if (!cliente || agendamento.clienteId !== cliente.id) {
        throw new ErroAplicacao('Acesso negado.', 403)
      }
      if (dados.status !== 'CANCELADO') {
        throw new ErroAplicacao('Clientes só podem cancelar agendamentos.', 403)
      }
    }

    // não permite alterar agendamentos já concluídos ou cancelados
    if (['CONCLUIDO', 'CANCELADO'].includes(agendamento.status)) {
      throw new ErroAplicacao(
        `Não é possível alterar um agendamento com status ${agendamento.status}.`,
        409
      )
    }

    return agendamentosRepository.atualizarStatus(id, dados.status)
  },

  async horariosDisponiveis(barbeariaId: string, dados: HorariosDisponiveisDTO) {
    const barbeiro = await barbeirosRepository.buscarPorId(dados.barbeiroId, barbeariaId)
    if (!barbeiro) {
      throw new ErroAplicacao('Barbeiro não encontrado.', 404)
    }

    const servico = await servicosRepository.buscarPorId(dados.servicoId, barbeariaId)
    if (!servico) {
      throw new ErroAplicacao('Serviço não encontrado.', 404)
    }

    const horarios = await gerarHorariosDisponiveis(
      dados.barbeiroId,
      dados.data,
      servico.duracao
    )

    return { data: dados.data, horarios }
  },
}
