/**
 * Comparação histórica, sazonalidade e antecipação — SPEC-3-012, CA-3-35 e CA-3-36.
 *
 * Agrega as vendas faturadas por produto e mês (data de faturamento, mapa aprovado em 21/10), compara
 * o mês de referência com o mesmo mês dos anos anteriores e só fala em sazonalidade quando a regra
 * aprovada pelo PCP é cumprida. Sem regra, ou com histórico abaixo dela: "histórico insuficiente" e
 * nenhuma sazonalidade. O baseline90-v1 não é tocado: isto é contexto e sugestão explicada. Variação
 * de consumo é "diferença", nunca "perda". A sugestão de antecipação não cria requisição.
 */

export interface RegraSuficiencia {
  versao: number
  aprovador: string
  /** Ciclos (anos anteriores com o mês lido) exigidos. */
  ciclosMinimos: number
  /** Cobertura mínima de cada ciclo (0 a 100): meses lidos nos 12 meses que terminam no mês do ciclo. */
  coberturaMinimaPct: number
}

export interface LinhaVenda {
  produto: string
  quantidade: number
  /** AAAA-MM-DD da data de faturamento. */
  dataFaturamento: string
}

const norm = (c: string) => String(c ?? '').trim().toUpperCase()
const num = (v: unknown) => (v === null || v === undefined || v === '' || !Number.isFinite(Number(v)) ? null : Number(v))
const dia = (v: unknown) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(v ?? ''))
  return m ? m[3] + '-' + m[2] + '-' + m[1] : null
}

/**
 * Linhas de venda de um pedido do Omie (ListarPedidos). Só entra pedido FATURADO com data de
 * faturamento; cancelado, denegado e devolvido (inteiro ou parcial) ficam de fora; item sem código ou
 * sem quantidade válida é ignorado (nunca vira zero).
 */
export function linhasDoPedido(p: any): LinhaVenda[] {
  const i = p?.infoCadastro ?? {}
  const sim = (x: unknown) => String(x ?? '').toUpperCase() === 'S'
  if (!sim(i.faturado) || sim(i.cancelado) || sim(i.denegado) || sim(i.devolvido) || sim(i.devolvido_parcial)) return []
  const data = dia(i.dFat)
  if (!data) return []
  const linhas: LinhaVenda[] = []
  for (const d of p?.det ?? []) {
    const pr = d?.produto ?? {}
    const cod = norm(pr.codigo || pr.codigo_produto)
    const q = num(pr.quantidade)
    if (!cod || q === null || q <= 0) continue
    linhas.push({ produto: cod, quantidade: q, dataFaturamento: data })
  }
  return linhas
}

export const periodoDe = (dataIso: string) => dataIso.slice(0, 7)

export type SerieMensal = { [produto: string]: { [periodo: string]: number } }

export function agregarPorMes(linhas: LinhaVenda[], base: SerieMensal = {}): SerieMensal {
  const s: SerieMensal = {}
  for (const k of Object.keys(base)) s[k] = { ...base[k] }
  for (const l of linhas) {
    const pr = norm(l.produto)
    s[pr] = s[pr] ?? {}
    const per = periodoDe(l.dataFaturamento)
    s[pr][per] = Math.round(((s[pr][per] ?? 0) + l.quantidade) * 1e6) / 1e6
  }
  return s
}

export interface CoberturaMes {
  periodo: string
  /** true só quando todas as páginas do mês foram lidas. */
  completo: boolean
}

const mesAnterior = (per: string, n: number) => {
  const [a, m] = per.split('-').map(Number)
  const t = a * 12 + (m - 1) - n
  return Math.floor(t / 12) + '-' + String((t % 12) + 1).padStart(2, '0')
}

/** Cobertura do ciclo que termina em `per`: meses lidos por inteiro nos 12 meses até ele (0 a 100). */
export function coberturaDoCiclo(per: string, lidos: Set<string>): number {
  let n = 0
  for (let k = 0; k < 12; k++) if (lidos.has(mesAnterior(per, k))) n++
  return Math.round((n / 12) * 10000) / 100
}

export interface CicloComparado {
  periodo: string
  ano: number
  quantidade: number | null
  coberturaPct: number
  lido: boolean
  /** Quanto o mês ficou acima (+) ou abaixo (−) da média mensal dos 12 meses do ciclo, em %. Null sem média. */
  indiceSobreMediaPct: number | null
}

export interface Comparacao {
  produto: string
  periodoAtual: string
  atual: { quantidade: number | null; lido: boolean }
  ciclos: CicloComparado[]
  /** Variação do mês de referência sobre a média do mesmo mês dos ciclos suficientes, em %. */
  variacaoSobreAnosAnterioresPct: number | null
  suficiente: boolean
  mensagem: string
  /** Média dos índices dos ciclos suficientes; só existe se a regra foi cumprida. */
  sazonalidadePct: number | null
}

export const HISTORICO_INSUFICIENTE = 'histórico insuficiente'

export function comparar(entrada: {
  produto: string
  periodoAtual: string
  serie: SerieMensal
  lidos: Set<string>
  regra: RegraSuficiencia | null
  anosParaOlhar?: number
}): Comparacao {
  const pr = norm(entrada.produto)
  const s = entrada.serie[pr] ?? {}
  const atualLido = entrada.lidos.has(entrada.periodoAtual)
  const atual = { quantidade: atualLido ? s[entrada.periodoAtual] ?? 0 : null, lido: atualLido }
  const ciclos: CicloComparado[] = []
  const anoRef = Number(entrada.periodoAtual.slice(0, 4))
  for (let k = 1; k <= (entrada.anosParaOlhar ?? 5); k++) {
    const per = entrada.periodoAtual.replace(String(anoRef), String(anoRef - k))
    const lido = entrada.lidos.has(per)
    const cob = coberturaDoCiclo(per, entrada.lidos)
    let indice: number | null = null
    if (lido) {
      const meses = Array.from({ length: 12 }, (_, j) => mesAnterior(per, j)).filter((m) => entrada.lidos.has(m))
      const media = meses.reduce((t, m) => t + (s[m] ?? 0), 0) / Math.max(1, meses.length)
      indice = media > 0 ? Math.round((((s[per] ?? 0) - media) / media) * 10000) / 100 : null
    }
    ciclos.push({ periodo: per, ano: anoRef - k, quantidade: lido ? s[per] ?? 0 : null, coberturaPct: cob, lido, indiceSobreMediaPct: indice })
  }
  const regra = entrada.regra
  const bons = regra ? ciclos.filter((c) => c.lido && c.coberturaPct >= regra.coberturaMinimaPct) : []
  const suficiente = !!regra && bons.length >= regra.ciclosMinimos && regra.ciclosMinimos > 0
  const comDados = bons.filter((c) => c.quantidade !== null)
  const mediaAnos = comDados.length > 0 ? comDados.reduce((t, c) => t + (c.quantidade as number), 0) / comDados.length : null
  const variacao = suficiente && mediaAnos !== null && mediaAnos > 0 && atual.quantidade !== null ? Math.round(((atual.quantidade - mediaAnos) / mediaAnos) * 10000) / 100 : null
  const indices = bons.map((c) => c.indiceSobreMediaPct).filter((x): x is number => x !== null)
  const saz = suficiente && indices.length > 0 ? Math.round((indices.reduce((t, x) => t + x, 0) / indices.length) * 100) / 100 : null
  let mensagem: string
  if (!regra) mensagem = HISTORICO_INSUFICIENTE + ': a regra de suficiência ainda não foi aprovada pelo PCP'
  else if (!suficiente) mensagem = HISTORICO_INSUFICIENTE + ': ' + bons.length + ' de ' + regra.ciclosMinimos + ' ciclos com cobertura de ' + regra.coberturaMinimaPct + '% ou mais'
  else mensagem = 'histórico suficiente (' + bons.length + ' ciclos)'
  return { produto: pr, periodoAtual: entrada.periodoAtual, atual, ciclos, variacaoSobreAnosAnterioresPct: variacao, suficiente, mensagem, sazonalidadePct: saz }
}

export interface SugestaoAntecipacao {
  sugerir: boolean
  dataSugeridaDeCompra: string | null
  texto: string
}

const soma = (iso: string, dias: number) => new Date(new Date(iso + 'T00:00:00Z').getTime() + dias * 86400000).toISOString().slice(0, 10)

/**
 * Para o insumo: se a sazonalidade é positiva (o mês costuma vender acima da média) e o histórico basta,
 * sugere comprar a data necessária menos o prazo do fornecedor. Sem prazo, sem data. É só texto
 * explicado; criar a requisição é uma decisão da pessoa, pelo fluxo da SPEC-3-005.
 */
export function sugerirAntecipacao(c: Comparacao, dataNecessaria: string, prazoFornecedorDias: number | null): SugestaoAntecipacao {
  if (!c.suficiente || c.sazonalidadePct === null) return { sugerir: false, dataSugeridaDeCompra: null, texto: c.mensagem }
  if (c.sazonalidadePct <= 0) {
    return { sugerir: false, dataSugeridaDeCompra: null, texto: 'nos anos anteriores este mês vendeu ' + Math.abs(c.sazonalidadePct) + '% abaixo da média do ano; não há o que antecipar' }
  }
  const base = 'no mesmo mês dos anos anteriores as vendas ficaram ' + c.sazonalidadePct + '% acima da média do ano'
  if (prazoFornecedorDias === null || !Number.isFinite(prazoFornecedorDias) || prazoFornecedorDias < 0) {
    return { sugerir: true, dataSugeridaDeCompra: null, texto: base + '; sem o prazo do fornecedor cadastrado, não há data sugerida' }
  }
  const data = soma(dataNecessaria, -prazoFornecedorDias)
  return { sugerir: true, dataSugeridaDeCompra: data, texto: base + '; com prazo do fornecedor de ' + prazoFornecedorDias + ' dias, considerar comprar até ' + data.split('-').reverse().join('/') }
}

export function validarRegra(r: { ciclosMinimos: unknown; coberturaMinimaPct: unknown }): string[] {
  const e: string[] = []
  const c = Number(r.ciclosMinimos)
  const p = Number(r.coberturaMinimaPct)
  if (!Number.isInteger(c) || c < 1 || c > 10) e.push('ciclos mínimos precisa ser um inteiro de 1 a 10')
  if (!Number.isFinite(p) || p <= 0 || p > 100) e.push('cobertura mínima precisa ser maior que 0 e até 100')
  return e
}
