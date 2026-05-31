import { dashboardRepository } from './dashboard.repository'

export const dashboardService = {
  async resumo(barbeariaId: string) {
    const [
      agendamentosHoje,
      agendamentosMes,
      clientesAtivos,
      assinaturasAtivas,
      receitaMes,
      barbeirosRanking,
      servicosRanking,
    ] = await Promise.all([
      dashboardRepository.agendamentosHoje(barbeariaId),
      dashboardRepository.agendamentosMes(barbeariaId),
      dashboardRepository.clientesAtivos(barbeariaId),
      dashboardRepository.assinaturasAtivas(barbeariaId),
      dashboardRepository.receitaMes(barbeariaId),
      dashboardRepository.barbeirosRanking(barbeariaId),
      dashboardRepository.servicosRanking(barbeariaId),
    ])

    return {
      agendamentosHoje,
      agendamentosMes,
      clientesAtivos,
      assinaturasAtivas,
      receitaMes,
      barbeirosRanking,
      servicosRanking,
    }
  },
}
