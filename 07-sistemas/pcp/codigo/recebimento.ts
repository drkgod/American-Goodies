/**
 * Recebimento conferido contra o pedido, parcelas e pré-conferência — SPEC-3-007, CA-3-19 a CA-3-22.
 *
 * O almoxarifado registra o que chegou e LIGA cada linha a um ou mais pedidos aprovados (a pessoa
 * liga; o sistema nunca infere por valor). A soma das ligações precisa bater com a linha. Falta,
 * sobra e item não pedido aparecem; NADA ajusta o estoque, classifica a nota ou lança no financeiro.
 * Compra já paga antes mostra o aviso e não gera parcela. A pré-conferência só aceita nota de
 * DEMONSTRAÇÃO marcada: leitura de nota real e escrita do recebimento no Omie estão em revisão
 * (CL-PEND-007) e não existem aqui.
 */
import { exigirAcao, type PerfilAcesso } from './acoes-compras.ts'
import { avaliarItem, MENSAGEM_CADASTRAR, type Excecao } from './bloqueio-item.ts'
import { converter, type Fator } from './conversao.ts'

export const AVISO_JA_PAGA = 'já paga: não lançar nova conta a pagar'
const EPS = 1e-6

export interface PedidoAprovado {
  pedidoId: string
  fornecedor: string
  linhas: { item: string; quantidadeEstoque: number }[]
}

export interface LigacaoLinha {
  pedidoId: string
  quantidade: number
}

export interface LinhaRecebida {
  item: string
  /** Informe a quantidade em estoque OU a de compra (com apresentação e unidade) para converter pelo fator. */
  quantidadeEstoque?: number
  quantidadeCompra?: number
  apresentacao?: string
  unidadeCompra?: string
  fornecedorDoFator?: string | null
  ligacoes: LigacaoLinha[]
}

export interface LinhaRegistrada {
  item: string
  quantidadeEstoque: number
  unidadeEstoque: string | null
  fatorUsado: number | null
  ligacoes: LigacaoLinha[]
  /** Linha aceita só por exceção autorizada (sem pedido aprovado ou item fora do catálogo). */
  porExcecao: boolean
  pendencias: string[]
}

export interface Diferenca {
  pedidoId: string
  item: string
  pedido: number
  recebido: number
  tipo: 'falta' | 'sobra'
  diferenca: number
}

export interface Recebimento {
  chave: string
  fornecedor: string
  data: string
  linhas: LinhaRegistrada[]
  diferencas: Diferenca[]
  /** Compras já pagas antes: o recebimento avisa e não gera conta a pagar nem parcela. */
  avisosJaPaga: string[]
  registradoPor: string
  registradoEm: string
}

const norm = (c: string) => String(c ?? '').trim().toUpperCase()
const arred = (n: number) => Math.round(n * 1e6) / 1e6

export type ResultadoRecebimento =
  | { ok: true; recebimento: Recebimento; criado: boolean }
  | { ok: false; http: 403; erro: 'sem_permissao' }
  | { ok: false; http: 422; erro: 'dados_invalidos' | 'soma_diferente' | 'sem_pedido_aprovado' | 'item_sem_cadastro'; motivos: string[] }

/** Diferenças de cada pedido, somando tudo o que já foi recebido contra ele (incluindo recebimentos anteriores). */
export function calcularDiferencas(pedidos: PedidoAprovado[], recebimentos: Recebimento[]): Diferenca[] {
  const recebido = new Map<string, number>()
  for (const r of recebimentos) {
    for (const l of r.linhas) {
      for (const g of l.ligacoes) {
        const k = g.pedidoId + '|' + norm(l.item)
        recebido.set(k, arred((recebido.get(k) ?? 0) + g.quantidade))
      }
    }
  }
  const out: Diferenca[] = []
  for (const p of pedidos) {
    for (const l of p.linhas) {
      const rec = recebido.get(p.pedidoId + '|' + norm(l.item))
      if (rec === undefined) continue // ainda não chegou nada: não é "falta", é pedido em aberto (SPEC-3-006)
      const dif = arred(rec - l.quantidadeEstoque)
      if (Math.abs(dif) > EPS) {
        out.push({ pedidoId: p.pedidoId, item: norm(l.item), pedido: l.quantidadeEstoque, recebido: rec, tipo: dif < 0 ? 'falta' : 'sobra', diferenca: Math.abs(dif) })
      }
    }
  }
  return out
}

export function registrarRecebimento(entrada: {
  perfil: PerfilAcesso | null
  usuario: string
  chave: string
  fornecedor: string
  data: string
  linhas: LinhaRecebida[]
  pedidos: PedidoAprovado[]
  anteriores: Recebimento[]
  fatores: Fator[]
  unidadePorItem: { [item: string]: string | null }
  catalogo: string[] | null
  excecoes: Excecao[]
  comprasPagas: string[]
  agora: Date
}): ResultadoRecebimento {
  if (!exigirAcao(entrada.perfil, 'conferir_recebimento').permitido) return { ok: false, http: 403, erro: 'sem_permissao' }
  const ja = entrada.anteriores.find((r) => r.chave === entrada.chave)
  if (ja) return { ok: true, recebimento: ja, criado: false }
  const motivos: string[] = []
  if (!entrada.chave.trim()) motivos.push('identificação do recebimento obrigatória')
  if (!entrada.fornecedor.trim()) motivos.push('fornecedor obrigatório')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entrada.data)) motivos.push('data da chegada inválida')
  if (entrada.linhas.length === 0) motivos.push('nenhuma linha recebida')
  if (motivos.length > 0) return { ok: false, http: 422, erro: 'dados_invalidos', motivos }

  const registradas: LinhaRegistrada[] = []
  const semCadastro: string[] = []
  const semPedido: string[] = []
  const soma: string[] = []
  const invalidos: string[] = []
  for (const l of entrada.linhas) {
    const item = norm(l.item)
    let q = l.quantidadeEstoque
    let fator: number | null = null
    const pend: string[] = []
    if (q === undefined && l.quantidadeCompra !== undefined) {
      const c = converter(entrada.fatores, { item, fornecedor: l.fornecedorDoFator ?? null, apresentacao: l.apresentacao ?? '', unidadeCompra: l.unidadeCompra ?? '', quantidade: l.quantidadeCompra, precoPorUnidadeCompra: null })
      if (c.estado === 'convertida') {
        q = c.quantidade
        fator = c.fatorUsado
      } else {
        invalidos.push(item + ': sem fator confirmado; informe a quantidade na unidade de estoque')
        continue
      }
    }
    if (q === undefined || !Number.isFinite(q) || q <= 0) {
      invalidos.push(item + ': quantidade precisa ser maior que zero')
      continue
    }
    const aval = avaliarItem({ item, catalogo: entrada.catalogo, documento: 'recebimento', documentoId: entrada.chave, excecoes: entrada.excecoes })
    let porExcecao = false
    if (!aval.liberado) {
      semCadastro.push(item + ': ' + (aval.motivo === 'fora_do_catalogo' ? MENSAGEM_CADASTRAR : aval.mensagem))
      continue
    }
    if (aval.via === 'excecao') {
      porExcecao = true
      pend.push('item fora do catálogo: exceção autorizada, pendente de cadastro no Omie e ligação ao pedido')
    }
    // ligações: pedido aprovado, do mesmo fornecedor, que tenha o item
    const ligs = l.ligacoes.filter((g) => g.quantidade > 0)
    for (const g of ligs) {
      const p = entrada.pedidos.find((x) => x.pedidoId === g.pedidoId)
      if (!p || norm(p.fornecedor) !== norm(entrada.fornecedor) || !p.linhas.some((x) => norm(x.item) === item)) {
        semPedido.push(item + ': pedido ' + g.pedidoId + ' não é um pedido aprovado deste fornecedor com este item')
      }
    }
    if (ligs.length === 0) {
      // RN-01: sem pedido aprovado só passa por exceção autorizada (item não pedido)
      const excItem = entrada.excecoes.some((x) => norm(x.item) === item && x.documento === 'recebimento' && x.documentoId === entrada.chave && x.estado === 'aberta')
      if (!excItem) {
        semPedido.push(item + ': sem pedido aprovado; só entra como exceção autorizada com motivo')
        continue
      }
      porExcecao = true
      pend.push('item não pedido: exceção autorizada')
    } else if (Math.abs(ligs.reduce((s, g) => s + g.quantidade, 0) - q) > EPS) {
      soma.push(item + ': a soma das ligações (' + arred(ligs.reduce((s, g) => s + g.quantidade, 0)) + ') difere da linha (' + q + ')')
      continue
    }
    registradas.push({ item, quantidadeEstoque: arred(q), unidadeEstoque: entrada.unidadePorItem[item] ?? null, fatorUsado: fator, ligacoes: ligs, porExcecao, pendencias: pend })
  }
  if (invalidos.length) return { ok: false, http: 422, erro: 'dados_invalidos', motivos: invalidos }
  if (semCadastro.length) return { ok: false, http: 422, erro: 'item_sem_cadastro', motivos: semCadastro }
  if (semPedido.length) return { ok: false, http: 422, erro: 'sem_pedido_aprovado', motivos: semPedido }
  if (soma.length) return { ok: false, http: 422, erro: 'soma_diferente', motivos: soma }

  const rec: Recebimento = {
    chave: entrada.chave,
    fornecedor: entrada.fornecedor,
    data: entrada.data,
    linhas: registradas,
    diferencas: [],
    avisosJaPaga: [],
    registradoPor: entrada.usuario,
    registradoEm: entrada.agora.toISOString(),
  }
  rec.diferencas = calcularDiferencas(entrada.pedidos, [...entrada.anteriores, rec]).filter((d) => registradas.some((l) => l.ligacoes.some((g) => g.pedidoId === d.pedidoId)))
  const pedidosTocados = new Set(registradas.flatMap((l) => l.ligacoes.map((g) => g.pedidoId)))
  rec.avisosJaPaga = [...pedidosTocados].filter((p) => entrada.comprasPagas.includes(p)).map((p) => 'pedido ' + p + ' — ' + AVISO_JA_PAGA)
  return { ok: true, recebimento: rec, criado: true }
}

// ---- Parcelas (CA-3-20) ----

export interface Parcela {
  pedidoId: string
  numero: number
  vencimento: string
  valor: number
  pagoAntecipado: boolean
  referenciaPagamento: string | null
}

export type ResultadoParcelas =
  | { ok: true; parcelas: Parcela[] }
  | { ok: false; http: 403; erro: 'sem_permissao' }
  | { ok: false; http: 422; erro: 'dados_invalidos'; motivos: string[] }

/** Registra as parcelas previstas de um pedido (uma por pedido e número; repetir atualiza a mesma). Não lança nada no financeiro. */
export function registrarParcelas(entrada: {
  perfil: PerfilAcesso | null
  pedidoId: string
  parcelas: { numero: number; vencimento: string; valor: number }[]
  existentes: Parcela[]
}): ResultadoParcelas {
  if (!exigirAcao(entrada.perfil, 'conferir_financeiro_recebimento').permitido) return { ok: false, http: 403, erro: 'sem_permissao' }
  const motivos: string[] = []
  const vistos = new Set<number>()
  for (const p of entrada.parcelas) {
    if (!Number.isInteger(p.numero) || p.numero < 1) motivos.push('número de parcela inválido')
    if (vistos.has(p.numero)) motivos.push('parcela ' + p.numero + ' repetida')
    vistos.add(p.numero)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.vencimento)) motivos.push('parcela ' + p.numero + ': vencimento inválido')
    if (!Number.isFinite(p.valor) || p.valor <= 0) motivos.push('parcela ' + p.numero + ': valor precisa ser maior que zero')
  }
  if (entrada.parcelas.length === 0) motivos.push('nenhuma parcela informada')
  if (motivos.length) return { ok: false, http: 422, erro: 'dados_invalidos', motivos }
  const resto = entrada.existentes.filter((e) => e.pedidoId !== entrada.pedidoId)
  const dele = entrada.existentes.filter((e) => e.pedidoId === entrada.pedidoId)
  const novas = entrada.parcelas.map((p) => {
    const antiga = dele.find((e) => e.numero === p.numero)
    return { pedidoId: entrada.pedidoId, numero: p.numero, vencimento: p.vencimento, valor: arred(p.valor), pagoAntecipado: antiga?.pagoAntecipado ?? false, referenciaPagamento: antiga?.referenciaPagamento ?? null }
  })
  return { ok: true, parcelas: [...resto, ...novas] }
}

/** Marca o pagamento antecipado de um pedido (todas as parcelas), com a referência. Só marca; não paga nem lança. */
export function marcarPagoAntecipado(entrada: {
  perfil: PerfilAcesso | null
  pedidoId: string
  referencia: string
  parcelas: Parcela[]
}): ResultadoParcelas {
  if (!exigirAcao(entrada.perfil, 'conferir_financeiro_recebimento').permitido) return { ok: false, http: 403, erro: 'sem_permissao' }
  if (!entrada.referencia.trim()) return { ok: false, http: 422, erro: 'dados_invalidos', motivos: ['referência do pagamento obrigatória'] }
  if (!entrada.parcelas.some((p) => p.pedidoId === entrada.pedidoId)) return { ok: false, http: 422, erro: 'dados_invalidos', motivos: ['pedido sem parcelas registradas'] }
  return {
    ok: true,
    parcelas: entrada.parcelas.map((p) => (p.pedidoId === entrada.pedidoId ? { ...p, pagoAntecipado: true, referenciaPagamento: entrada.referencia.trim() } : p)),
  }
}

/** Pedidos com todas as parcelas pagas antecipadamente: o recebimento avisa e nunca cria conta a pagar. */
export function pedidosJaPagos(parcelas: Parcela[]): string[] {
  const por = new Map<string, Parcela[]>()
  for (const p of parcelas) por.set(p.pedidoId, [...(por.get(p.pedidoId) ?? []), p])
  return [...por.entries()].filter(([, ps]) => ps.length > 0 && ps.every((p) => p.pagoAntecipado)).map(([id]) => id)
}

// ---- Pré-conferência com nota de demonstração (CA-3-22) ----

export interface NotaDemo {
  demonstracao: boolean
  emitente: string
  numero: string
  serie: string
  itens: { item: string; quantidade: number; unidade: string; valor: number }[]
  duplicatas: { numero: number; vencimento: string; valor: number }[]
}

export interface Pendencia {
  tipo: 'item_nao_pedido' | 'quantidade' | 'item_nao_recebido' | 'duplicata' | 'total_duplicatas'
  item?: string
  esperado: number | string | null
  encontrado: number | string | null
  diferenca?: number
  mensagem: string
}

export type ResultadoPreConferencia =
  | { ok: true; estado: 'conferida' | 'pendente'; pendencias: Pendencia[]; avisos: string[] }
  | { ok: false; http: 403; erro: 'sem_permissao' }
  | { ok: false; http: 422; erro: 'nota_real_nao_entra'; motivo: string }

export function preConferir(entrada: {
  perfil: PerfilAcesso | null
  nota: NotaDemo
  pedido: PedidoAprovado
  recebimentos: Recebimento[]
  parcelas: Parcela[]
}): ResultadoPreConferencia {
  if (!exigirAcao(entrada.perfil, 'conferir_recebimento').permitido) return { ok: false, http: 403, erro: 'sem_permissao' }
  if (entrada.nota.demonstracao !== true) {
    return { ok: false, http: 422, erro: 'nota_real_nao_entra', motivo: 'só nota de demonstração marcada; a leitura de nota real está em revisão (CL-PEND-007)' }
  }
  const pend: Pendencia[] = []
  const avisos: string[] = []
  const notaPorItem = new Map<string, number>()
  for (const i of entrada.nota.itens) notaPorItem.set(norm(i.item), arred((notaPorItem.get(norm(i.item)) ?? 0) + i.quantidade))
  const recPorItem = new Map<string, number>()
  for (const r of entrada.recebimentos) {
    for (const l of r.linhas) {
      for (const g of l.ligacoes) {
        if (g.pedidoId === entrada.pedido.pedidoId) recPorItem.set(norm(l.item), arred((recPorItem.get(norm(l.item)) ?? 0) + g.quantidade))
      }
    }
  }
  const pedidoPorItem = new Map(entrada.pedido.linhas.map((l) => [norm(l.item), l.quantidadeEstoque]))
  for (const [item, qNota] of notaPorItem) {
    const qPed = pedidoPorItem.get(item)
    if (qPed === undefined) {
      pend.push({ tipo: 'item_nao_pedido', item, esperado: null, encontrado: qNota, mensagem: 'item ' + item + ' está na nota e não está no pedido' })
      continue
    }
    const qRec = recPorItem.get(item)
    if (qRec === undefined) {
      pend.push({ tipo: 'item_nao_recebido', item, esperado: qPed, encontrado: null, mensagem: 'item ' + item + ' está na nota e ainda não foi recebido' })
    }
    for (const [rotulo, ref] of [['pedido', qPed], ['recebimento', qRec]] as const) {
      if (ref !== undefined && Math.abs(qNota - ref) > EPS) {
        const d = arred(qNota - ref)
        pend.push({ tipo: 'quantidade', item, esperado: ref, encontrado: qNota, diferenca: Math.abs(d), mensagem: 'item ' + item + ': nota ' + qNota + ' contra ' + rotulo + ' ' + ref + ' (diferença de ' + Math.abs(d) + ')' })
      }
    }
  }
  const parcelasPed = entrada.parcelas.filter((p) => p.pedidoId === entrada.pedido.pedidoId)
  if (parcelasPed.length > 0) {
    const totalP = arred(parcelasPed.reduce((s, p) => s + p.valor, 0))
    const totalN = arred(entrada.nota.duplicatas.reduce((s, d) => s + d.valor, 0))
    if (Math.abs(totalP - totalN) > 0.005) {
      pend.push({ tipo: 'total_duplicatas', esperado: totalP, encontrado: totalN, diferenca: Math.abs(arred(totalP - totalN)), mensagem: 'duplicatas da nota somam ' + totalN + ' e as parcelas do pedido somam ' + totalP })
    }
    if (pedidosJaPagos(entrada.parcelas).includes(entrada.pedido.pedidoId)) avisos.push(AVISO_JA_PAGA)
  }
  return { ok: true, estado: pend.length === 0 ? 'conferida' : 'pendente', pendencias: pend, avisos }
}
