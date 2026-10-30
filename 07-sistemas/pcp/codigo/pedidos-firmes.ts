export interface LinhaPedido {
  pedido_id: string
  linha_id: string
  produto_id: string
  unidade: string | null
  quantidade_pedida: number
  quantidade_atendida: number
  status: string
  data_operacional: string | null
}

export interface MapaPedidos {
  versao: string
  status_elegiveis: string[]
  campo_data: 'data_operacional'
  horizonte_de: string
  horizonte_ate: string
}

export type SaldoLinha =
  | { linha_id: string; firme: number; unidade: string; estado: 'elegivel' }
  | { linha_id: string; firme: 0; unidade: string; estado: 'excluida' }
  | { linha_id: string; firme: null; unidade: string | null; estado: 'bloqueada'; motivo: string }

export interface ResultadoPedidos {
  mapa_versao: string
  linhas: SaldoLinha[]
  total_firme: number | null
  bloqueios: string[]
}

function dentroDoHorizonte(data: string | null, mapa: MapaPedidos): boolean | null {
  if (!data) return null
  return data >= mapa.horizonte_de && data <= mapa.horizonte_ate
}

export function saldoFirme(linhas: LinhaPedido[], mapa: MapaPedidos): ResultadoPedidos {
  const vistos = new Set<string>()
  const resultado: SaldoLinha[] = []
  const bloqueios: string[] = []
  let total: number | null = 0
  for (const l of linhas) {
    const chave = l.pedido_id + '+' + l.linha_id
    if (vistos.has(chave)) continue
    vistos.add(chave)
    const unidade = l.unidade ?? ''
    if (l.status === null || l.status === undefined || l.status === '') {
      bloqueios.push(chave + ': status ausente')
      resultado.push({
        linha_id: l.linha_id,
        firme: null,
        unidade: l.unidade ?? null,
        estado: 'bloqueada',
        motivo: 'status desconhecido',
      })
      total = null
      continue
    }
    if (
      !mapa.status_elegiveis.includes(l.status) &&
      !['cancelado', 'denegado'].includes(l.status)
    ) {
      bloqueios.push(chave + ': status fora do mapa (' + l.status + ')')
      resultado.push({
        linha_id: l.linha_id,
        firme: null,
        unidade: l.unidade ?? null,
        estado: 'bloqueada',
        motivo: 'status fora do mapa',
      })
      total = null
      continue
    }
    if (l.status === 'cancelado' || l.status === 'denegado') {
      resultado.push({ linha_id: l.linha_id, firme: 0, unidade, estado: 'excluida' })
      continue
    }
    const noHorizonte = dentroDoHorizonte(l.data_operacional, mapa)
    if (noHorizonte === null) {
      bloqueios.push(chave + ': data operacional ausente')
      resultado.push({
        linha_id: l.linha_id,
        firme: null,
        unidade,
        estado: 'bloqueada',
        motivo: 'data ausente',
      })
      total = null
      continue
    }
    if (!noHorizonte) {
      resultado.push({ linha_id: l.linha_id, firme: 0, unidade, estado: 'excluida' })
      continue
    }
    const restante = l.quantidade_pedida - l.quantidade_atendida
    if (restante < 0 || !(l.quantidade_pedida >= 0) || !(l.quantidade_atendida >= 0)) {
      bloqueios.push(chave + ': saldo inconsistente')
      resultado.push({
        linha_id: l.linha_id,
        firme: null,
        unidade,
        estado: 'bloqueada',
        motivo: 'saldo inconsistente',
      })
      total = null
      continue
    }
    resultado.push({ linha_id: l.linha_id, firme: restante, unidade, estado: 'elegivel' })
    if (total !== null) total += restante
  }
  return { mapa_versao: mapa.versao, linhas: resultado, total_firme: total, bloqueios }
}
