/**
 * Relatórios comparativos — SPEC-3-014, CA-3-39 e CA-3-40.
 *
 * Funções puras que montam os blocos: produção (planejado × produzido × conferido), consumo (ficha ×
 * registrado, com diferença sem causa, perda declarada, resíduo e revisão de receita SEPARADOS), taxa
 * de perda declarada (mesma unidade, denominador escrito), compras (comprado × recebido, entregas no
 * prazo, preço médio por fornecedor) e pedidos (por origem e unidade, aptos, bloqueados e tempo até
 * liberar). Unidades diferentes nunca se somam; dado ausente é "sem dados"/null, nunca zero; intenção da
 * Nuvemshop não entra no confirmado; nada é chamado de desperdício, fraude ou perda sem declaração.
 */

const norm = (c: string) => String(c ?? '').trim().toUpperCase()
const arred = (n: number, c = 1e6) => Math.round(n * c) / c

export type AreaBloco = 'producao' | 'consumo' | 'compras' | 'pedidos'

/** Cada bloco exige a área correspondente; sem ela o bloco não aparece e nada indica que existe. */
const AREAS_DO_BLOCO: Record<AreaBloco, string[]> = {
  producao: ['planejamento', 'apontar_producao'],
  consumo: ['planejamento', 'apontar_producao'],
  compras: ['compras'],
  pedidos: ['faturamento'],
}
export function blocoVisivel(areasDoPerfil: string[] | null, bloco: string): boolean {
  if (!areasDoPerfil || !(bloco in AREAS_DO_BLOCO)) return false
  return AREAS_DO_BLOCO[bloco as AreaBloco].some((a) => areasDoPerfil.indexOf(a) !== -1)
}

export const SEM_DADOS = 'sem dados no período'

export interface Rodape {
  periodo: { de: string; ate: string }
  fonte: string
  atualizadoEm: string | null
  lacunas: string[]
  semDados: boolean
}

// ---- produção ----

export interface OrdemProducao {
  op: string
  produto: string
  unidade: string
  planejado: number | null
  produzido: number | null
  conferido: number | null
}
export interface LinhaProducao {
  produto: string
  unidade: string
  planejado: number | null
  produzido: number | null
  conferido: number | null
  ordens: number
}

/** Totais por produto E unidade; uma parcela ausente deixa o total daquela coluna null (nunca soma parcial calada). */
export function relatorioProducao(ordens: OrdemProducao[]): LinhaProducao[] {
  const m = new Map<string, LinhaProducao & { _f: { p: boolean; r: boolean; c: boolean } }>()
  for (const o of ordens) {
    const k = norm(o.produto) + '|' + norm(o.unidade)
    const l = m.get(k) ?? { produto: norm(o.produto), unidade: norm(o.unidade), planejado: 0, produzido: 0, conferido: 0, ordens: 0, _f: { p: false, r: false, c: false } }
    l.ordens++
    for (const [campo, flag] of [['planejado', 'p'], ['produzido', 'r'], ['conferido', 'c']] as const) {
      const v = o[campo]
      if (v === null || !Number.isFinite(v)) l._f[flag] = true
      else l[campo] = arred((l[campo] as number) + v)
    }
    m.set(k, l)
  }
  return [...m.values()].map(({ _f, ...l }) => ({ ...l, planejado: _f.p ? null : l.planejado, produzido: _f.r ? null : l.produzido, conferido: _f.c ? null : l.conferido }))
}

// ---- consumo e perdas ----

export interface ConsumoEntrada {
  item: string
  unidade: string
  /** Pela ficha, para o realizado; null = sem ficha compatível. */
  previsto: number | null
  registrado: number
  perdaDeclarada: number
  residuo: number
  revisaoReceita: number
}
export interface LinhaConsumo {
  item: string
  unidade: string
  previsto: number | null
  registrado: number
  diferenca: number | null
  /** As quatro categorias, separadas. */
  diferencaSemCausa: number | null
  perdaDeclarada: number
  residuo: number
  revisaoReceita: number
  calculavel: boolean
  nota: string
}

/**
 * Consumo registrado acima da ficha sem perda declarada é "diferença sem causa", nunca perda. O que
 * foi declarado (perda, resíduo, revisão de receita) fica nas suas colunas; só o que sobra da diferença
 * depois dessas declarações é "sem causa". Sem ficha compatível não há previsto nem diferença.
 */
export function relatorioConsumo(entradas: ConsumoEntrada[]): LinhaConsumo[] {
  return entradas.map((e) => {
    const base = { item: norm(e.item), unidade: norm(e.unidade), registrado: e.registrado, perdaDeclarada: e.perdaDeclarada, residuo: e.residuo, revisaoReceita: e.revisaoReceita }
    if (e.previsto === null) return { ...base, previsto: null, diferenca: null, diferencaSemCausa: null, calculavel: false, nota: 'sem ficha compatível: diferença não calculada' }
    const dif = arred(e.registrado - e.previsto)
    const declarado = e.perdaDeclarada + e.residuo + e.revisaoReceita
    const semCausa = dif > 0 ? arred(Math.max(0, dif - declarado)) : 0
    return { ...base, previsto: e.previsto, diferenca: dif, diferencaSemCausa: semCausa, calculavel: true, nota: dif > 0 && semCausa > 0 ? 'diferença sem causa declarada (não é perda)' : dif < 0 ? 'abaixo da ficha' : '' }
  })
}

export interface TaxaPerda {
  calculavel: boolean
  pct: number | null
  denominador: string | null
  motivo: string | null
}

/** Taxa de perda declarada = perda declarada ÷ produção realizada, na mesma unidade, com o denominador escrito. */
export function taxaPerdaDeclarada(e: { perdaDeclarada: number; unidadePerda: string | null; produzido: number | null; unidadeProduzida: string | null }): TaxaPerda {
  if (e.produzido === null || !(e.produzido > 0)) return { calculavel: false, pct: null, denominador: null, motivo: 'não calculável: sem produção realizada no período' }
  if (!e.unidadePerda || !e.unidadeProduzida || norm(e.unidadePerda) !== norm(e.unidadeProduzida)) return { calculavel: false, pct: null, denominador: null, motivo: 'não calculável: unidade da perda diferente da unidade produzida' }
  return { calculavel: true, pct: arred((e.perdaDeclarada / e.produzido) * 100, 100), denominador: e.produzido + ' ' + norm(e.unidadeProduzida) + ' produzidas', motivo: null }
}

// ---- compras ----

export interface LinhaCompra {
  fornecedor: string
  item: string
  unidade: string
  comprado: number
  recebido: number
  /** Data necessária da compra e data do recebimento (AAAA-MM-DD); null = ainda não recebido. */
  dataNecessaria: string | null
  dataRecebimento: string | null
  /** Preço por unidade de estoque; null = sem preço. */
  preco: number | null
}
export interface RelatorioCompras {
  porUnidade: { unidade: string; comprado: number; recebido: number }[]
  entregas: { comRecebimento: number; noPrazo: number; atrasadas: number; pctNoPrazo: number | null }
  precoMedio: { fornecedor: string; unidade: string; precoMedio: number; quantidadeBase: number }[]
  lacunas: string[]
}

export function relatorioCompras(linhas: LinhaCompra[]): RelatorioCompras {
  const un = new Map<string, { unidade: string; comprado: number; recebido: number }>()
  const pm = new Map<string, { fornecedor: string; unidade: string; valor: number; qtd: number }>()
  let comRec = 0
  let noPrazo = 0
  let semPreco = 0
  let semData = 0
  for (const l of linhas) {
    const u = un.get(norm(l.unidade)) ?? { unidade: norm(l.unidade), comprado: 0, recebido: 0 }
    u.comprado = arred(u.comprado + l.comprado)
    u.recebido = arred(u.recebido + l.recebido)
    un.set(norm(l.unidade), u)
    if (l.dataRecebimento) {
      if (l.dataNecessaria) {
        comRec++
        if (l.dataRecebimento <= l.dataNecessaria) noPrazo++
      } else semData++
    }
    if (l.preco === null || !Number.isFinite(l.preco) || l.comprado <= 0) {
      semPreco++
      continue
    }
    const k = norm(l.fornecedor) + '|' + norm(l.unidade)
    const p = pm.get(k) ?? { fornecedor: norm(l.fornecedor), unidade: norm(l.unidade), valor: 0, qtd: 0 }
    p.valor += l.preco * l.comprado
    p.qtd += l.comprado
    pm.set(k, p)
  }
  const lacunas: string[] = []
  if (semPreco > 0) lacunas.push(semPreco + ' linhas sem preço ficaram fora do preço médio')
  if (semData > 0) lacunas.push(semData + ' recebimentos sem data necessária da compra ficaram fora de "no prazo"')
  return {
    porUnidade: [...un.values()],
    entregas: { comRecebimento: comRec, noPrazo, atrasadas: comRec - noPrazo, pctNoPrazo: comRec > 0 ? arred((noPrazo / comRec) * 100, 100) : null },
    precoMedio: [...pm.values()].map((p) => ({ fornecedor: p.fornecedor, unidade: p.unidade, precoMedio: arred(p.valor / p.qtd, 1e4), quantidadeBase: arred(p.qtd) })),
    lacunas,
  }
}

// ---- pedidos ----

export interface LinhaPedido {
  origem: string
  unidade: string | null
  estado: 'apto' | 'bloqueado' | 'liberado'
  /** Nuvemshop não paga é intenção e não entra no confirmado. */
  situacaoCanal: 'confirmado' | 'intencao' | null
  criadoEm: string
  liberadoEm: string | null
}
export interface RelatorioPedidos {
  confirmados: { origem: string; unidade: string; total: number; aptos: number; bloqueados: number; liberados: number }[]
  intencoes: number
  horasAteLiberar: { media: number | null; pedidos: number }
}

export function relatorioPedidos(pedidos: LinhaPedido[]): RelatorioPedidos {
  const m = new Map<string, { origem: string; unidade: string; total: number; aptos: number; bloqueados: number; liberados: number }>()
  let intencoes = 0
  const horas: number[] = []
  for (const p of pedidos) {
    if (p.situacaoCanal === 'intencao') {
      intencoes++
      continue
    }
    const k = p.origem + '|' + (p.unidade ?? 'sem unidade')
    const l = m.get(k) ?? { origem: p.origem, unidade: p.unidade ?? 'sem unidade', total: 0, aptos: 0, bloqueados: 0, liberados: 0 }
    l.total++
    if (p.estado === 'apto') l.aptos++
    else if (p.estado === 'bloqueado') l.bloqueados++
    else l.liberados++
    m.set(k, l)
    if (p.liberadoEm) horas.push((new Date(p.liberadoEm).getTime() - new Date(p.criadoEm).getTime()) / 3600000)
  }
  return {
    confirmados: [...m.values()],
    intencoes,
    horasAteLiberar: { media: horas.length > 0 ? arred(horas.reduce((a, b) => a + b, 0) / horas.length, 100) : null, pedidos: horas.length },
  }
}

// ---- exportação ----

/** CSV para planilha. Células que começariam com = + - @ ganham um apóstrofo (planilha não executa fórmula vinda do dado). */
export function paraCsv(cabecalho: string[], linhas: (string | number | null)[][]): string {
  const cel = (v: string | number | null) => {
    let s = v === null ? '' : String(v)
    if (/^[=+\-@\t\r]/.test(s) && typeof v === 'string') s = "'" + s
    return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  return [cabecalho, ...linhas].map((l) => l.map(cel).join(';')).join('\r\n')
}
