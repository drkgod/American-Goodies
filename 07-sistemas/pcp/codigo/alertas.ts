/**
 * Parâmetros e alertas — SPEC-3-010, CA-3-30 a CA-3-32.
 *
 * Seis tipos de alerta por regras fixas e explicadas, sobre parâmetros em versão aprovada. Parâmetro
 * ausente nunca vira valor padrão: o alerta daquele item não é calculado e a lacuna aparece. O
 * parâmetro do produto prevalece sobre o da família, campo a campo. O alerta só informa: não compra,
 * não publica ordem, não muda parâmetro e não gera ação financeira (nenhum alerta carrega ação).
 * A mesma chave (regra + item + referência) abre um alerta só; a rodada seguinte o atualiza.
 */

export type TipoAlerta = 'estoque' | 'producao' | 'compra' | 'preco' | 'pedido' | 'divergencia'
export type Gravidade = 'critico' | 'atencao'

export interface CamposParametro {
  estoqueMinimo: number | null
  prazoFornecedorDias: number | null
  toleranciaPrecoPct: number | null
  atrasoAceitoDias: number | null
  tempoMaxParadoHoras: number | null
  compraSemPedidoDias: number | null
}
export type CampoNome = keyof CamposParametro

export interface ParametroAlerta extends Partial<CamposParametro> {
  escopo: 'produto' | 'familia'
  /** Código do produto ou nome da família. */
  chave: string
}

export interface ParametrosAlerta {
  versao: number
  aprovador: string
  aprovadoEm: string
  itens: ParametroAlerta[]
  /** Gravidade por regra, na versão aprovada. Ausente = alerta daquele tipo não é calculado. */
  gravidade: Partial<Record<Exclude<TipoAlerta, 'estoque'>, Gravidade>>
}

/** familia → produtos (definida pelo PCP). Um produto pertence a uma família no máximo. */
export type Familias = { [familia: string]: string[] }

const norm = (c: string) => String(c ?? '').trim().toUpperCase()

const CAMPOS: CampoNome[] = [
  'estoqueMinimo',
  'prazoFornecedorDias',
  'toleranciaPrecoPct',
  'atrasoAceitoDias',
  'tempoMaxParadoHoras',
  'compraSemPedidoDias',
]

/** Parâmetro efetivo de um produto: o do produto vale mais que o da família, campo a campo; ausente = null. */
export function parametroEfetivo(p: ParametrosAlerta | null, familias: Familias, produto: string): CamposParametro {
  const vazio: CamposParametro = {
    estoqueMinimo: null,
    prazoFornecedorDias: null,
    toleranciaPrecoPct: null,
    atrasoAceitoDias: null,
    tempoMaxParadoHoras: null,
    compraSemPedidoDias: null,
  }
  if (!p) return vazio
  const prod = norm(produto)
  const doProduto = p.itens.find((i) => i.escopo === 'produto' && norm(i.chave) === prod)
  const fam = Object.keys(familias).find((f) => familias[f].some((x) => norm(x) === prod))
  const daFamilia = fam ? p.itens.find((i) => i.escopo === 'familia' && norm(i.chave) === norm(fam)) : undefined
  const r = { ...vazio }
  for (const c of CAMPOS) {
    const v = doProduto?.[c] ?? daFamilia?.[c] ?? null
    r[c] = typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null
  }
  return r
}

export interface Lacuna {
  regra: TipoAlerta
  item: string
  campo: string
  motivo: string
}

export function validarParametros(itens: ParametroAlerta[]): string[] {
  const erros: string[] = []
  const vistos = new Set<string>()
  for (const i of itens) {
    if (i.escopo !== 'produto' && i.escopo !== 'familia') erros.push('escopo inválido em ' + i.chave)
    if (!norm(i.chave)) erros.push('produto ou família obrigatório')
    const k = i.escopo + ':' + norm(i.chave)
    if (vistos.has(k)) erros.push('parâmetro repetido: ' + i.chave)
    vistos.add(k)
    for (const c of CAMPOS) {
      const v = i[c]
      if (v !== undefined && v !== null && (!Number.isFinite(v) || v < 0)) erros.push(c + ' de ' + i.chave + ' precisa ser um número maior ou igual a zero')
    }
  }
  return erros
}

export interface Alerta {
  tipo: TipoAlerta
  item: string
  referencia: string
  chave: string
  gravidade: Gravidade
  regra: string
  /** Números usados na regra, para o alerta ser explicável. */
  valores: { [nome: string]: number | string | null }
  versaoParametros: number
  dadoEm: string
  fonteDesatualizada: boolean
}
export type ResultadoRegra = { alerta: Alerta } | { lacuna: Lacuna } | { nenhum: true }

const HORA = 3600 * 1000
const DIA = 24 * HORA
const FONTE_VELHA_HORAS = 24

export const chaveDoAlerta = (tipo: TipoAlerta, item: string, referencia: string) => tipo + '|' + norm(item) + '|' + String(referencia ?? '').trim()

function montar(
  p: ParametrosAlerta,
  tipo: TipoAlerta,
  item: string,
  referencia: string,
  gravidade: Gravidade,
  regra: string,
  valores: Alerta['valores'],
  dadoEm: Date,
  agora: Date,
): ResultadoRegra {
  return {
    alerta: {
      tipo,
      item: norm(item),
      referencia,
      chave: chaveDoAlerta(tipo, item, referencia),
      gravidade,
      regra,
      valores,
      versaoParametros: p.versao,
      dadoEm: dadoEm.toISOString(),
      fonteDesatualizada: agora.getTime() - dadoEm.getTime() > FONTE_VELHA_HORAS * HORA,
    },
  }
}

const lac = (regra: TipoAlerta, item: string, campo: string, motivo: string): ResultadoRegra => ({ lacuna: { regra, item: norm(item), campo, motivo } })

/** Gravidade definida na versão aprovada; sem ela o alerta do tipo não é calculado. */
function gravidadeDe(p: ParametrosAlerta, tipo: Exclude<TipoAlerta, 'estoque'>, item: string): Gravidade | ResultadoRegra {
  const g = p.gravidade[tipo]
  return g ? g : lac(tipo, item, 'gravidade', 'gravidade do alerta ' + tipo + ' não definida na versão aprovada')
}

// ---- RN-01 estoque ----

export interface EntradaEstoque {
  item: string
  unidade: string
  saldo: number | null
  aReceber: { data: string; quantidade: number }[]
  consumoDia: number | null
  unidadeConsumo: string
  dadoEm: Date
}

/**
 * Ruptura prevista: saldo + compras a receber até o prazo do fornecedor − consumo previsto no prazo
 * < mínimo. A antecedência é o prazo do fornecedor. Crítico se o projetado chega a zero ou menos.
 * Sem mínimo, prazo ou consumo: lacuna. Unidade do consumo diferente da do saldo: lacuna.
 */
export function regraEstoque(p: ParametrosAlerta, ef: CamposParametro, e: EntradaEstoque, hoje: Date, agora: Date): ResultadoRegra {
  if (ef.estoqueMinimo === null) return lac('estoque', e.item, 'estoqueMinimo', 'estoque mínimo não cadastrado')
  if (ef.prazoFornecedorDias === null) return lac('estoque', e.item, 'prazoFornecedorDias', 'prazo do fornecedor não cadastrado')
  if (e.consumoDia === null || e.saldo === null) return lac('estoque', e.item, 'consumoDia', 'saldo ou consumo previsto indisponível')
  if (norm(e.unidade) !== norm(e.unidadeConsumo)) return lac('estoque', e.item, 'unidade', 'unidade do consumo (' + e.unidadeConsumo + ') diferente da do saldo (' + e.unidade + ')')
  const limite = hoje.getTime() + ef.prazoFornecedorDias * DIA
  const chegando = e.aReceber.filter((r) => new Date(r.data + 'T23:59:59Z').getTime() <= limite).reduce((s, r) => s + r.quantidade, 0)
  const projetado = e.saldo + chegando - e.consumoDia * ef.prazoFornecedorDias
  if (projetado >= ef.estoqueMinimo) return { nenhum: true }
  // dias até o saldo atual (sem recebimentos) cair abaixo do mínimo; 0 se já está abaixo
  const dias = e.consumoDia > 0 ? Math.max(0, Math.floor((e.saldo - ef.estoqueMinimo) / e.consumoDia)) : 0
  const grav: Gravidade = projetado <= 0 ? 'critico' : 'atencao'
  return montar(
    p,
    'estoque',
    e.item,
    '',
    grav,
    'ruptura prevista em ' + dias + ' dias (antecedência = prazo do fornecedor)',
    { saldo: e.saldo, aReceberNoPrazo: chegando, consumoDia: e.consumoDia, minimo: ef.estoqueMinimo, prazoDias: ef.prazoFornecedorDias, projetado, diasAteMinimo: dias, unidade: e.unidade },
    e.dadoEm,
    agora,
  )
}

// ---- RN-02 produção ----

export function regraProducao(p: ParametrosAlerta, e: { item: string; ordem: string; diaProgramado: string; iniciada: boolean; dadoEm: Date }, hoje: Date, agora: Date): ResultadoRegra {
  const g = gravidadeDe(p, 'producao', e.item)
  if (typeof g !== 'string') return g
  const hojeIso = hoje.toISOString().slice(0, 10)
  if (e.iniciada || e.diaProgramado >= hojeIso) return { nenhum: true }
  const atraso = Math.round((new Date(hojeIso).getTime() - new Date(e.diaProgramado).getTime()) / DIA)
  return montar(p, 'producao', e.item, e.ordem, g, 'ordem programada não iniciada depois do dia programado', { diaProgramado: e.diaProgramado, diasDeAtraso: atraso }, e.dadoEm, agora)
}

// ---- RN-03 compra ----

export function regraEntregaAtrasada(
  p: ParametrosAlerta,
  ef: CamposParametro,
  e: { item: string; pedido: string; dataPrevista: string; restante: number; dadoEm: Date },
  hoje: Date,
  agora: Date,
): ResultadoRegra {
  if (ef.atrasoAceitoDias === null) return lac('compra', e.item, 'atrasoAceitoDias', 'atraso aceito de entrega não cadastrado')
  const g = gravidadeDe(p, 'compra', e.item)
  if (typeof g !== 'string') return g
  const atraso = Math.round((new Date(hoje.toISOString().slice(0, 10)).getTime() - new Date(e.dataPrevista).getTime()) / DIA)
  if (e.restante <= 0 || atraso <= ef.atrasoAceitoDias) return { nenhum: true }
  return montar(p, 'compra', e.item, 'entrega:' + e.pedido, g, 'entrega atrasada além do atraso aceito', { dataPrevista: e.dataPrevista, diasDeAtraso: atraso, atrasoAceitoDias: ef.atrasoAceitoDias, restante: e.restante }, e.dadoEm, agora)
}

export function regraCompraSemPedido(
  p: ParametrosAlerta,
  ef: CamposParametro,
  e: { item: string; requisicao: string; aprovadaEm: Date; temPedido: boolean; dadoEm: Date },
  agora: Date,
): ResultadoRegra {
  if (ef.compraSemPedidoDias === null) return lac('compra', e.item, 'compraSemPedidoDias', 'prazo para lançar o pedido não cadastrado')
  const g = gravidadeDe(p, 'compra', e.item)
  if (typeof g !== 'string') return g
  const dias = Math.floor((agora.getTime() - e.aprovadaEm.getTime()) / DIA)
  if (e.temPedido || dias <= ef.compraSemPedidoDias) return { nenhum: true }
  return montar(p, 'compra', e.item, 'sem-pedido:' + e.requisicao, g, 'compra aprovada sem pedido além do prazo', { aprovadaEm: e.aprovadaEm.toISOString(), diasSemPedido: dias, prazoDias: ef.compraSemPedidoDias }, e.dadoEm, agora)
}

// ---- RN-04 preço ----

export function regraPreco(
  p: ParametrosAlerta,
  ef: CamposParametro,
  e: { item: string; referencia: string; precoPorUnidadeEstoque: number | null; ultimoPreco: number | null; dadoEm: Date },
  agora: Date,
): ResultadoRegra {
  if (ef.toleranciaPrecoPct === null) return lac('preco', e.item, 'toleranciaPrecoPct', 'tolerância de preço não cadastrada')
  if (e.precoPorUnidadeEstoque === null) return lac('preco', e.item, 'preco', 'preço sem fator confirmado: não é comparado')
  if (e.ultimoPreco === null || e.ultimoPreco <= 0) return lac('preco', e.item, 'historico', 'sem histórico para comparar')
  const g = gravidadeDe(p, 'preco', e.item)
  if (typeof g !== 'string') return g
  const dif = Math.round(((e.precoPorUnidadeEstoque - e.ultimoPreco) / e.ultimoPreco) * 1e4) / 100
  if (dif <= ef.toleranciaPrecoPct) return { nenhum: true }
  return montar(p, 'preco', e.item, e.referencia, g, 'preço acima da tolerância sobre o histórico', { preco: e.precoPorUnidadeEstoque, ultimoPreco: e.ultimoPreco, diferencaPct: dif, toleranciaPct: ef.toleranciaPrecoPct }, e.dadoEm, agora)
}

// ---- RN-05 pedido ----

export function regraPedidoParado(
  p: ParametrosAlerta,
  tempoMaxHoras: number | null,
  e: { pedido: string; motivo: 'bloqueado_para_faturar' | 'intencao_pendente'; desde: Date; dadoEm: Date },
  agora: Date,
): ResultadoRegra {
  if (tempoMaxHoras === null) return lac('pedido', e.pedido, 'tempoMaxParadoHoras', 'tempo máximo parado não cadastrado')
  const g = gravidadeDe(p, 'pedido', e.pedido)
  if (typeof g !== 'string') return g
  const horas = Math.floor((agora.getTime() - e.desde.getTime()) / HORA)
  if (horas <= tempoMaxHoras) return { nenhum: true }
  return montar(p, 'pedido', e.pedido, e.motivo, g, e.motivo === 'bloqueado_para_faturar' ? 'pedido bloqueado para faturar além do tempo máximo' : 'intenção da Nuvemshop pendente além do tempo máximo', { desde: e.desde.toISOString(), horasParado: horas, tempoMaxHoras }, e.dadoEm, agora)
}

// ---- RN-06 divergência ----

export function regraDivergencia(p: ParametrosAlerta, e: { conferencia: string; item: string; temDiferenca: boolean; decididaPeloPcp: boolean; diferenca: number | null; dadoEm: Date }, agora: Date): ResultadoRegra {
  const g = gravidadeDe(p, 'divergencia', e.item)
  if (typeof g !== 'string') return g
  if (!e.temDiferenca || e.decididaPeloPcp) return { nenhum: true }
  return montar(p, 'divergencia', e.item, e.conferencia, g, 'conferência com diferença sem decisão do PCP', { diferenca: e.diferenca }, e.dadoEm, agora)
}

// ---- RN-07 rodada: mesma chave atualiza o alerta aberto ----

export interface AlertaGuardado extends Alerta {
  ocorrencia: number
  estado: 'aberto' | 'em_analise' | 'tratado'
  /** Ocorrência anterior da mesma chave, se esta nasceu depois de um alerta tratado (RN-03 da SPEC-3-011). */
  anteriorOcorrencia: number | null
  abertoEm: string
  atualizadoEm: string
  atualizacoes: number
}

export function aplicarRodada(existentes: AlertaGuardado[], gerados: Alerta[], agora: Date): { lista: AlertaGuardado[]; criados: number; atualizados: number } {
  const lista = existentes.map((a) => ({ ...a }))
  let criados = 0
  let atualizados = 0
  const jaNaRodada = new Set<string>()
  for (const g of gerados) {
    if (jaNaRodada.has(g.chave)) continue
    jaNaRodada.add(g.chave)
    const aberto = lista.find((a) => a.chave === g.chave && a.estado !== 'tratado')
    if (aberto) {
      Object.assign(aberto, g, { atualizadoEm: agora.toISOString(), atualizacoes: aberto.atualizacoes + 1 })
      atualizados++
    } else {
      const ocorrencia = lista.filter((a) => a.chave === g.chave).reduce((m, a) => Math.max(m, a.ocorrencia), 0) + 1
      const anteriorOcorrencia = ocorrencia > 1 ? ocorrencia - 1 : null
      lista.push({ ...g, ocorrencia, anteriorOcorrencia, estado: 'aberto', abertoEm: agora.toISOString(), atualizadoEm: agora.toISOString(), atualizacoes: 0 })
      criados++
    }
  }
  return { lista, criados, atualizados }
}

export function resumoDeLacunas(lacunas: Lacuna[]): { porCampo: { [campo: string]: number }; total: number } {
  const porCampo: { [campo: string]: number } = {}
  for (const l of lacunas) porCampo[l.campo] = (porCampo[l.campo] ?? 0) + 1
  return { porCampo, total: lacunas.length }
}
