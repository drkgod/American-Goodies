export interface LinhaCatalogo {
  codigo: string
  descricao: string
  unidade: string | null
  ativo: boolean
  origem: 'consulta_dirigida'
}

export type ResultadoCodigo =
  | { codigo: string; estado: 'ok'; linha: LinhaCatalogo }
  | { codigo: string; estado: 'nao_encontrado'; pendencia: string }
  | { codigo: string; estado: 'invalido'; pendencia: string }

export function normalizarProduto(
  codigo: string,
  resposta: {
    descricao?: string | null
    unidade?: string | null
    inativo?: string | boolean | null
  } | null,
): ResultadoCodigo {
  if (!resposta || (!resposta.descricao && resposta.descricao !== '')) {
    return {
      codigo,
      estado: 'nao_encontrado',
      pendencia: 'produto não encontrado no Omie por código ' + codigo,
    }
  }
  const unidade =
    resposta.unidade === null || resposta.unidade === undefined || resposta.unidade === ''
      ? null
      : String(resposta.unidade)
  const inativo =
    resposta.inativo === true || resposta.inativo === 'S' || resposta.inativo === 'true'
  return {
    codigo,
    estado: 'ok',
    linha: {
      codigo,
      descricao: String(resposta.descricao ?? ''),
      unidade,
      ativo: !inativo,
      origem: 'consulta_dirigida',
    },
  }
}

export function planoConsulta(
  codigos: string[],
  porLote = 30,
): { lote: number; codigos: string[]; pausa_ms: number }[] {
  const lotes: { lote: number; codigos: string[]; pausa_ms: number }[] = []
  for (let i = 0; i < codigos.length; i += porLote) {
    const n = Math.floor(i / porLote) + 1
    lotes.push({ lote: n, codigos: codigos.slice(i, i + porLote), pausa_ms: n > 1 ? 1000 : 0 })
  }
  return lotes
}

export interface EstadoCatalogo {
  porCodigo: { [codigo: string]: LinhaCatalogo }
  pendencias: string[]
}

export function novoCatalogo(): EstadoCatalogo {
  return { porCodigo: {}, pendencias: [] }
}

export function aplicarResultados(
  e: EstadoCatalogo,
  resultados: ResultadoCodigo[],
): EstadoCatalogo {
  for (const r of resultados) {
    if (r.estado === 'ok') {
      e.porCodigo[r.codigo] = r.linha
    } else {
      const p = r.pendencia
      if (!e.pendencias.includes(p)) e.pendencias.push(p)
    }
  }
  return e
}

export function cobertura(
  e: EstadoCatalogo,
  codigos: string[],
): {
  ok: number
  pendentes: number
  total: number
  cobertura_pct: number
} {
  const alvo = Array.from(new Set(codigos))
  const ok = alvo.filter((c) => e.porCodigo[c]).length
  const total = alvo.length
  return {
    ok,
    pendentes: total - ok,
    total,
    cobertura_pct: total === 0 ? 0 : Math.round((ok / total) * 1000) / 10,
  }
}
