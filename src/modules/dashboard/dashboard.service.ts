import { dashboardRepository } from './dashboard.repository'

export const dashboardService = {
  async resumo(barbeariaId: string) {
    const [
      agendamentosHoje,
      agendamentosMes,
      clientesAtivos,
      assinaturasAtivas,
      receitaMes,
      servicosConcluidosMes,
      clientesRecorrentesMes,
      agendamentosPendentes,
      barbeirosSemDisponibilidade,
      clientesSemRetorno30Dias,
      horariosVagosHoje,
      barbeirosRanking,
      servicosRanking,
    ] = await Promise.all([
      dashboardRepository.agendamentosHoje(barbeariaId),
      dashboardRepository.agendamentosMes(barbeariaId),
      dashboardRepository.clientesAtivos(barbeariaId),
      dashboardRepository.assinaturasAtivas(barbeariaId),
      dashboardRepository.receitaMes(barbeariaId),
      dashboardRepository.servicosConcluidosMes(barbeariaId),
      dashboardRepository.clientesRecorrentesMes(barbeariaId),
      dashboardRepository.agendamentosPendentes(barbeariaId),
      dashboardRepository.barbeirosSemDisponibilidade(barbeariaId),
      dashboardRepository.clientesSemRetorno30Dias(barbeariaId),
      dashboardRepository.horariosVagosHoje(barbeariaId),
      dashboardRepository.barbeirosRanking(barbeariaId),
      dashboardRepository.servicosRanking(barbeariaId),
    ])

    const ticketMedio = servicosConcluidosMes > 0 ? receitaMes / servicosConcluidosMes : 0

    return {
      agendamentosHoje,
      agendamentosMes,
      clientesAtivos,
      assinaturasAtivas,
      receitaMes,
      servicosConcluidosMes,
      ticketMedio,
      clientesRecorrentesMes,
      agendamentosPendentes,
      barbeirosSemDisponibilidade,
      clientesSemRetorno30Dias,
      horariosVagosHoje,
      barbeirosRanking,
      servicosRanking,
    }
  },
}
