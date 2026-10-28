/**
 * Unidades, nomes por canal, tabela de preço e origem do pedido — SPEC-3-008, CA-3-24 e CA-3-25.
 *
 * Cada cliente do Omie que recebe pedido tem uma unidade operacional e o nome fantasia usado na
 * operação, com versões (autor e hora). O nome vindo de um canal NUNCA troca o nome operacional
 * sozinho: se diferir, fica "a revisar" até o faturamento aceitar (com registro) ou recusar. A tabela
 * de preço é versionada por vigência; o subtotal é recalculado ao lado do subtotal do pedido e nada
 * é trocado no pedido. Pedido da Nuvemshop não pago é intenção. Origem sem referência comprovada é
 * "a confirmar": nunca liga por cliente e valor.
 */
import { exigirAcaoFat, type PerfilFat } from './acoes-faturamento.ts'

export type TipoUnidade = 'franquia' | 'loja_propria' | 'cliente_b2b'
export const TIPOS_UNIDADE: TipoUnidade[] = ['franquia', 'loja_propria', 'cliente_b2b']

export interface Unidade {
  clienteOmie: string
  unidade: string
  nomeFantasiaOperacional: string
  tipo: TipoUnidade
  ativo: boolean
  versao: number
  alteradoPor: string
  alteradoEm: string
}

export type ResultadoUnidade =
  | { ok: true; lista: Unidade[]; unidade: Unidade }
  | { ok: false; http: 403; erro: 'sem_permissao' }
  | { ok: false; http: 409; erro: 'conflito_de_versao' }
  | { ok: false; http: 422; erro: 'dados_invalidos'; motivos: string[] }

const txt = (v: unknown) => String(v ?? '').trim()

export function unidadeVigente(lista: Unidade[], clienteOmie: string): Unidade | null {
  return lista.filter((u) => u.clienteOmie === clienteOmie).reduce<Unidade | null>((m, u) => (m === null || u.versao > m.versao ? u : m), null)
}

/** Grava uma versão nova da unidade (as anteriores ficam). Versão esperada: 0 para o primeiro cadastro. */
export function salvarUnidade(entrada: {
  perfil: PerfilFat | null
  usuario: string
  lista: Unidade[]
  clienteOmie: string
  unidade: string
  nomeFantasiaOperacional: string
  tipo: string
  ativo?: boolean
  versaoEsperada: number
  agora: Date
}): ResultadoUnidade {
  if (!exigirAcaoFat(entrada.perfil, 'editar_unidade').permitido) return { ok: false, http: 403, erro: 'sem_permissao' }
  const motivos: string[] = []
  if (!txt(entrada.clienteOmie)) motivos.push('cliente do Omie obrigatório')
  if (!txt(entrada.unidade)) motivos.push('unidade obrigatória')
  if (!txt(entrada.nomeFantasiaOperacional)) motivos.push('nome fantasia operacional obrigatório')
  if (!TIPOS_UNIDADE.includes(entrada.tipo as TipoUnidade)) motivos.push('tipo deve ser franquia, loja própria ou cliente B2B')
  if (motivos.length) return { ok: false, http: 422, erro: 'dados_invalidos', motivos }
  const atual = unidadeVigente(entrada.lista, txt(entrada.clienteOmie))
  if ((atual?.versao ?? 0) !== entrada.versaoEsperada) return { ok: false, http: 409, erro: 'conflito_de_versao' }
  const nova: Unidade = {
    clienteOmie: txt(entrada.clienteOmie),
    unidade: txt(entrada.unidade),
    nomeFantasiaOperacional: txt(entrada.nomeFantasiaOperacional),
    tipo: entrada.tipo as TipoUnidade,
    ativo: entrada.ativo !== false,
    versao: (atual?.versao ?? 0) + 1,
    alteradoPor: entrada.usuario,
    alteradoEm: entrada.agora.toISOString(),
  }
  return { ok: true, lista: [...entrada.lista, nova], unidade: nova }
}

// ---- Nomes por canal (RN-01) ----

export type CanalNome = 'omie' | 'lunet' | 'nuvemshop' | 'manual'
export type EstadoNome = 'igual' | 'a_revisar' | 'aceito' | 'recusado'

export interface NomeCanal {
  canal: CanalNome
  clienteOmie: string
  nomeRecebido: string
  estado: EstadoNome
  decididoPor: string | null
  decididoEm: string | null
}

const sem = (s: string) =>
  txt(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()

/** Registra um nome recebido de um canal. Igual ao operacional: "igual". Diferente: "a revisar". Nunca altera a unidade. */
export function registrarNomeCanal(entrada: {
  perfil: PerfilFat | null
  unidades: Unidade[]
  nomes: NomeCanal[]
  canal: CanalNome
  clienteOmie: string
  nomeRecebido: string
}): { ok: true; nomes: NomeCanal[]; nome: NomeCanal; unidadesIntactas: true } | { ok: false; http: 403; erro: 'sem_permissao' } | { ok: false; http: 422; erro: 'unidade_nao_cadastrada' | 'dados_invalidos' } {
  if (!exigirAcaoFat(entrada.perfil, 'editar_unidade').permitido) return { ok: false, http: 403, erro: 'sem_permissao' }
  if (!txt(entrada.nomeRecebido)) return { ok: false, http: 422, erro: 'dados_invalidos' }
  const u = unidadeVigente(entrada.unidades, entrada.clienteOmie)
  if (!u) return { ok: false, http: 422, erro: 'unidade_nao_cadastrada' }
  const igual = sem(u.nomeFantasiaOperacional) === sem(entrada.nomeRecebido)
  const existente = entrada.nomes.find((n) => n.canal === entrada.canal && n.clienteOmie === entrada.clienteOmie && sem(n.nomeRecebido) === sem(entrada.nomeRecebido))
  if (existente) return { ok: true, nomes: entrada.nomes, nome: existente, unidadesIntactas: true }
  const nome: NomeCanal = {
    canal: entrada.canal,
    clienteOmie: entrada.clienteOmie,
    nomeRecebido: txt(entrada.nomeRecebido),
    estado: igual ? 'igual' : 'a_revisar',
    decididoPor: null,
    decididoEm: null,
  }
  return { ok: true, nomes: [...entrada.nomes, nome], nome, unidadesIntactas: true }
}

/** Faturamento aceita (o nome vira o operacional, em versão nova com autor e hora) ou recusa (nada muda). */
export function decidirNomeCanal(entrada: {
  perfil: PerfilFat | null
  usuario: string
  unidades: Unidade[]
  nomes: NomeCanal[]
  canal: CanalNome
  clienteOmie: string
  nomeRecebido: string
  decisao: 'aceito' | 'recusado'
  agora: Date
}): { ok: true; unidades: Unidade[]; nomes: NomeCanal[] } | { ok: false; http: 403 | 422; erro: string } {
  if (!exigirAcaoFat(entrada.perfil, 'editar_unidade').permitido) return { ok: false, http: 403, erro: 'sem_permissao' }
  const alvo = entrada.nomes.find((n) => n.canal === entrada.canal && n.clienteOmie === entrada.clienteOmie && sem(n.nomeRecebido) === sem(entrada.nomeRecebido))
  if (!alvo || alvo.estado !== 'a_revisar') return { ok: false, http: 422, erro: 'nada_a_revisar' }
  let unidades = entrada.unidades
  if (entrada.decisao === 'aceito') {
    const atual = unidadeVigente(entrada.unidades, entrada.clienteOmie)
    if (!atual) return { ok: false, http: 422, erro: 'unidade_nao_cadastrada' }
    unidades = [...unidades, { ...atual, nomeFantasiaOperacional: alvo.nomeRecebido, versao: atual.versao + 1, alteradoPor: entrada.usuario, alteradoEm: entrada.agora.toISOString() }]
  }
  const nomes = entrada.nomes.map((n) => (n === alvo ? { ...n, estado: entrada.decisao, decididoPor: entrada.usuario, decididoEm: entrada.agora.toISOString() } : n))
  return { ok: true, unidades, nomes }
}

// ---- Tabela de preço (CA-3-25) ----

export interface PrecoTabela {
  /** Unidade (cliente do Omie) ou '*' para o grupo geral. */
  chave: string
  item: string
  preco: number
  unidade: string
  vigenciaInicio: string
  versao: number
  origem: 'omie' | 'operacional'
}

export function precoVigente(tabela: PrecoTabela[], chave: string, item: string, data: string): PrecoTabela | null {
  const ok = (c: string) =>
    tabela
      .filter((p) => p.chave === c && p.item.toUpperCase() === item.toUpperCase() && p.vigenciaInicio <= data)
      .reduce<PrecoTabela | null>((m, p) => (m === null || p.vigenciaInicio > m.vigenciaInicio || (p.vigenciaInicio === m.vigenciaInicio && p.versao > m.versao) ? p : m), null)
  return ok(chave) ?? ok('*')
}

export function salvarPreco(entrada: {
  perfil: PerfilFat | null
  tabela: PrecoTabela[]
  chave: string
  item: string
  preco: number
  unidade: string
  vigenciaInicio: string
}): { ok: true; tabela: PrecoTabela[]; preco: PrecoTabela } | { ok: false; http: 403; erro: 'sem_permissao' } | { ok: false; http: 422; erro: 'dados_invalidos'; motivos: string[] } {
  if (!exigirAcaoFat(entrada.perfil, 'editar_unidade').permitido) return { ok: false, http: 403, erro: 'sem_permissao' }
  const motivos: string[] = []
  if (!txt(entrada.chave)) motivos.push('unidade ou grupo obrigatório')
  if (!txt(entrada.item)) motivos.push('item obrigatório')
  if (!Number.isFinite(entrada.preco) || entrada.preco <= 0) motivos.push('preço precisa ser maior que zero')
  if (!txt(entrada.unidade)) motivos.push('unidade do preço obrigatória')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entrada.vigenciaInicio)) motivos.push('início da vigência inválido')
  if (motivos.length) return { ok: false, http: 422, erro: 'dados_invalidos', motivos }
  const anteriores = entrada.tabela.filter((p) => p.chave === entrada.chave && p.item.toUpperCase() === entrada.item.toUpperCase() && p.vigenciaInicio === entrada.vigenciaInicio)
  const preco: PrecoTabela = { chave: txt(entrada.chave), item: txt(entrada.item).toUpperCase(), preco: Math.round(entrada.preco * 1e6) / 1e6, unidade: txt(entrada.unidade), vigenciaInicio: entrada.vigenciaInicio, versao: anteriores.reduce((m, p) => Math.max(m, p.versao), 0) + 1, origem: 'operacional' }
  return { ok: true, tabela: [...entrada.tabela, preco], preco }
}

// ---- Pedido: subtotal recalculado, origem e situação ----

export type OrigemPedido = 'omie' | 'lunet_pelo_omie' | 'nuvemshop' | 'manual' | 'a_confirmar'

/** Origem só quando comprovada por referência; sem referência, "a confirmar" (nunca por cliente e valor). */
export function classificarOrigem(p: { canal: 'omie' | 'lunet' | 'nuvemshop' | 'manual' | null; referenciaComprovada: boolean }): OrigemPedido {
  if (!p.canal) return 'a_confirmar'
  if (p.canal === 'omie' || p.canal === 'manual') return p.canal
  if (!p.referenciaComprovada) return 'a_confirmar'
  return p.canal === 'lunet' ? 'lunet_pelo_omie' : 'nuvemshop'
}

/** Nuvemshop: só pedido pago é confirmado; pendente, autorizado e o resto seguem como intenção. */
export function situacaoNuvemshop(pagamento: string): 'confirmado' | 'intencao' {
  return txt(pagamento).toLowerCase() === 'paid' ? 'confirmado' : 'intencao'
}

export interface PedidoParaPreparar {
  pedidoId: string
  clienteOmie: string
  data: string
  origem: OrigemPedido
  situacaoCanal?: 'confirmado' | 'intencao'
  itens: { item: string; quantidade: number; precoPedido: number | null }[]
  subtotalPedido: number | null
}

export interface AnalisePedido {
  pedidoId: string
  origem: OrigemPedido
  situacaoCanal: 'confirmado' | 'intencao' | null
  unidade: { unidade: string; nomeFantasiaOperacional: string } | null
  unidadeNaoCadastrada: boolean
  aptoParaPreparar: boolean
  motivos: string[]
  itens: { item: string; quantidade: number; precoPedido: number | null; precoTabela: number | null; diferenteDaTabela: boolean; semPreco: boolean }[]
  subtotalRecalculado: number | null
  subtotalPedido: number | null
  diferenca: number | null
  subtotalPendente: string[]
}

export function analisarPedido(p: PedidoParaPreparar, unidades: Unidade[], tabela: PrecoTabela[]): AnalisePedido {
  const u = unidadeVigente(unidades, p.clienteOmie)
  const motivos: string[] = []
  if (!u || !u.ativo) motivos.push('Unidade não cadastrada')
  if (p.origem === 'a_confirmar') motivos.push('Origem a confirmar')
  if (p.situacaoCanal === 'intencao') motivos.push('Pedido ainda não pago (intenção)')
  const chave = u?.clienteOmie ?? p.clienteOmie
  const sem: string[] = []
  let total = 0
  const itens = p.itens.map((i) => {
    const pt = precoVigente(tabela, chave, i.item, p.data)
    if (!pt) sem.push(i.item.toUpperCase())
    else total += i.quantidade * pt.preco
    return {
      item: i.item.toUpperCase(),
      quantidade: i.quantidade,
      precoPedido: i.precoPedido,
      precoTabela: pt?.preco ?? null,
      diferenteDaTabela: !!pt && i.precoPedido !== null && Math.abs(i.precoPedido - pt.preco) > 0.005,
      semPreco: !pt,
    }
  })
  const recal = sem.length === 0 && p.itens.length > 0 ? Math.round(total * 100) / 100 : null
  return {
    pedidoId: p.pedidoId,
    origem: p.origem,
    situacaoCanal: p.situacaoCanal ?? null,
    unidade: u ? { unidade: u.unidade, nomeFantasiaOperacional: u.nomeFantasiaOperacional } : null,
    unidadeNaoCadastrada: !u || !u.ativo,
    aptoParaPreparar: motivos.length === 0,
    motivos,
    itens,
    subtotalRecalculado: recal,
    subtotalPedido: p.subtotalPedido,
    diferenca: recal !== null && p.subtotalPedido !== null ? Math.round((p.subtotalPedido - recal) * 100) / 100 : null,
    subtotalPendente: sem,
  }
}
