/**
 * Produção gravada no servidor como fonte de relatório e de alerta — SPEC-4-001, CA-4-33.
 *
 * Contrato puro (os hooks repetem a conta, pois hooks não compartilham código). Não muda fórmula:
 * o relatório de produção continua sendo `relatorioProducao` (relatorios.ts) e a regra de produção
 * atrasada continua sendo `regraProducao` (alertas.ts). Aqui só se monta a ENTRADA delas a partir da
 * programação publicada, dos apontamentos e das conferências do servidor. Registro marcado como
 * demonstração (conta de teste ou produto de demonstração) não entra.
 *
 * - produzido = realizado da cozinha (retificado não conta duas vezes); sem nenhum evento = sem dado, nunca 0;
 * - conferido = a última conferência de entrada em câmara da ordem; sem conferência = sem dado, nunca 0;
 * - a programação não traz unidade: a unidade é a dos apontamentos e conferências da ordem e, sem nenhum,
 *   UN (a unidade das conferências); a lacuna é escrita no rodapé;
 * - ordem iniciada = tem pelo menos um apontamento (não demonstração).
 */
import { produtoEhDemonstracao } from './demonstracao.ts'
import type { OrdemProducao } from './relatorios.ts'

export interface OrdemProgramadaLida {
  op_id: string
  produto: string
  quantidade: number
  data: string
}
export interface EventoGravado {
  evento_id: string
  op_id: string
  ponto: string
  tipo: string
  quantidade: number
  unidade: string
  retifica?: string | null
  demonstracao?: boolean
}
export interface ConferenciaGravada {
  op_id: string
  etapa: string
  quantidade: number
  unidade: string
  demonstracao?: boolean
}
export interface ProgramacaoGravada {
  ops: OrdemProgramadaLida[]
  demonstracao?: boolean
}

export const UNIDADE_PADRAO = 'UN'

/** Última programação que não é de demonstração: é a que vale para relatório e alerta. */
export function programacaoReal(versoes: ProgramacaoGravada[]): ProgramacaoGravada | null {
  const reais = versoes.filter((p) => p.demonstracao !== true)
  return reais.length > 0 ? reais[reais.length - 1] : null
}

export const ehReal = (r: { demonstracao?: boolean }) => r.demonstracao !== true

export interface EntradaRelatorioProducao {
  ordens: OrdemProducao[]
  semApontamento: number
  semConferencia: number
}

/** Entrada do `relatorioProducao`: uma linha por ordem do período, sem registros de demonstração. */
export function ordensDoRelatorio(
  programacao: ProgramacaoGravada | null,
  eventos: EventoGravado[],
  conferencias: ConferenciaGravada[],
  periodo: { de: string; ate: string },
  produto?: string,
): EntradaRelatorioProducao {
  const alvo = produto ? produto.trim().toUpperCase() : ''
  const ops = (programacao?.ops ?? []).filter(
    (o) =>
      o.data >= periodo.de &&
      o.data <= periodo.ate &&
      !produtoEhDemonstracao(o.produto) &&
      (!alvo || o.produto.trim().toUpperCase() === alvo),
  )
  const evReais = eventos.filter(ehReal)
  const cfReais = conferencias.filter(ehReal)
  const retificados = new Set(evReais.filter((e) => e.retifica).map((e) => e.retifica as string))
  let semApontamento = 0
  let semConferencia = 0
  const ordens: OrdemProducao[] = ops.map((o) => {
    let produzido: number | null = null
    let unidade = ''
    for (const e of evReais) {
      if (e.op_id !== o.op_id || e.tipo !== 'realizado' || e.ponto !== 'cozinha' || retificados.has(e.evento_id)) continue
      produzido = (produzido ?? 0) + e.quantidade
      if (!unidade) unidade = e.unidade
    }
    let conferido: number | null = null
    for (const c of cfReais) {
      if (c.op_id !== o.op_id || c.etapa !== 'entrada_camara') continue
      conferido = c.quantidade
      if (!unidade) unidade = c.unidade
    }
    if (produzido === null) semApontamento++
    if (conferido === null) semConferencia++
    return {
      op: o.op_id,
      produto: o.produto,
      unidade: unidade || UNIDADE_PADRAO,
      planejado: o.quantidade,
      produzido,
      conferido,
    }
  })
  return { ordens, semApontamento, semConferencia }
}

export interface EntradaProducaoAtrasada {
  item: string
  ordem: string
  diaProgramado: string
  iniciada: boolean
}

/**
 * Ordens da programação real que entram na regra de produção atrasada (`regraProducao`). A regra decide
 * se há alerta (dia programado antes de hoje e ordem não iniciada); aqui só se tira o que é demonstração.
 */
export function entradasProducaoAtrasada(
  programacao: ProgramacaoGravada | null,
  eventos: EventoGravado[],
): EntradaProducaoAtrasada[] {
  const iniciadas = new Set(eventos.filter(ehReal).map((e) => e.op_id))
  return (programacao?.ops ?? [])
    .filter((o) => !produtoEhDemonstracao(o.produto))
    .map((o) => ({ item: o.produto, ordem: o.op_id, diaProgramado: o.data, iniciada: iniciadas.has(o.op_id) }))
}

/** Lacunas do rodapé do bloco de produção. */
export function lacunasDaProducao(e: EntradaRelatorioProducao): string[] {
  const l = [
    'produzido = realizado da cozinha; conferido = última conferência de entrada em câmara; ordem sem apontamento ou sem conferência fica sem dado (nunca zero)',
    'a programação não traz unidade: vale a unidade dos apontamentos e das conferências da ordem e, sem nenhum, UN',
  ]
  if (e.semApontamento > 0) l.push(`${e.semApontamento} ordem(ns) sem apontamento da cozinha no período`)
  if (e.semConferencia > 0) l.push(`${e.semConferencia} ordem(ns) sem conferência de câmara no período`)
  return l
}
