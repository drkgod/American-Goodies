/**
 * LOOP-01: alertas críticos tratados — SPEC-3-013, CA-3-37 e CA-3-38.
 *
 * Medida do ciclo = alertas críticos tratados COM ação registrada ÷ alertas críticos gerados no ciclo.
 * Ciclo sem crítico: "não aplicável", nunca 100%. Tratado sem ação não conta. O loop só mede, lembra e
 * registra o veredito do validador: não trata alerta, não compra e não reprograma. Nasce DESLIGADO e só
 * liga com linha de base, alvo, janela e validador definidos pelo cliente (CL-PEND-005); veredito
 * registrado congela a medição do ciclo.
 */
import { ACOES_DE_TRATAMENTO } from './tratamento-alertas.ts'

export const LOOP_ID = 'LOOP-01'

export interface AlertaParaMedir {
  gravidade: 'critico' | 'atencao'
  /** ISO do momento em que o alerta nasceu. */
  abertoEm: string
  estado: 'aberto' | 'em_analise' | 'tratado'
  acao: string | null
  tratadoEm: string | null
}

export interface Medicao {
  loop: string
  cicloInicio: string
  cicloFim: string
  gerados: number
  tratados: number
  /** 0 a 100; null quando não aplicável ou pendente. */
  proporcaoPct: number | null
  naoAplicavel: boolean
  pendente: boolean
  motivoPendente: string | null
  veredito: 'atingido' | 'nao_atingido' | null
  vereditoPor: string | null
  vereditoEm: string | null
  vereditoTexto: string | null
  congelada: boolean
  calculadoEm: string
}

const ehAcaoValida = (a: string | null) => !!a && (ACOES_DE_TRATAMENTO as readonly string[]).indexOf(a) !== -1

export function medirCiclo(e: {
  cicloInicio: string
  cicloFim: string
  alertas: AlertaParaMedir[]
  fonteCompleta: boolean
  agora: Date
}): Medicao {
  const ini = new Date(e.cicloInicio).getTime()
  const fim = new Date(e.cicloFim).getTime()
  const base = {
    loop: LOOP_ID,
    cicloInicio: e.cicloInicio,
    cicloFim: e.cicloFim,
    veredito: null,
    vereditoPor: null,
    vereditoEm: null,
    vereditoTexto: null,
    congelada: false,
    calculadoEm: e.agora.toISOString(),
  } as const
  if (!e.fonteCompleta) {
    return { ...base, gerados: 0, tratados: 0, proporcaoPct: null, naoAplicavel: false, pendente: true, motivoPendente: 'fonte incompleta: a medição espera a próxima rodada' }
  }
  const criticos = e.alertas.filter((a) => a.gravidade === 'critico' && new Date(a.abertoEm).getTime() >= ini && new Date(a.abertoEm).getTime() <= fim)
  // tratado só conta com ação registrada (RN-02) e dentro do ciclo
  const tratados = criticos.filter((a) => a.estado === 'tratado' && ehAcaoValida(a.acao) && !!a.tratadoEm && new Date(a.tratadoEm).getTime() <= fim)
  if (criticos.length === 0) {
    return { ...base, gerados: 0, tratados: 0, proporcaoPct: null, naoAplicavel: true, pendente: false, motivoPendente: null }
  }
  return {
    ...base,
    gerados: criticos.length,
    tratados: tratados.length,
    proporcaoPct: Math.round((tratados.length / criticos.length) * 10000) / 100,
    naoAplicavel: false,
    pendente: false,
    motivoPendente: null,
  }
}

/** Recalcular substitui a medição do mesmo ciclo SÓ antes do veredito; depois dele a medição está congelada. */
export function recalcular(existente: Medicao | null, nova: Medicao): Medicao {
  if (existente && existente.congelada) return existente
  return nova
}

export interface ConfigLoop {
  ativo: boolean
  baselinePct: number | null
  alvoPct: number | null
  janelaDias: number | null
  validador: string | null
}

export const configInicial = (): ConfigLoop => ({ ativo: false, baselinePct: null, alvoPct: null, janelaDias: null, validador: null })

export function faltaParaLigar(c: ConfigLoop): string[] {
  const f: string[] = []
  if (c.baselinePct === null || !Number.isFinite(c.baselinePct) || c.baselinePct < 0 || c.baselinePct > 100) f.push('linha de base')
  if (c.alvoPct === null || !Number.isFinite(c.alvoPct) || c.alvoPct <= 0 || c.alvoPct > 100) f.push('alvo')
  if (c.janelaDias === null || !Number.isInteger(c.janelaDias) || c.janelaDias < 1 || c.janelaDias > 366) f.push('janela')
  if (!c.validador || !String(c.validador).trim()) f.push('validador')
  return f
}

export type ResultadoConfig =
  | { ok: true; config: ConfigLoop }
  | { ok: false; http: 403; erro: 'sem_permissao' }
  | { ok: false; http: 422; erro: 'condicoes_nao_cumpridas'; faltam: string[] }

/** Define a configuração. Pedir para ligar sem as quatro condições é recusado e o loop continua desligado. */
export function definirConfig(e: {
  podeEditar: boolean
  atual: ConfigLoop
  novo: { baselinePct?: number | null; alvoPct?: number | null; janelaDias?: number | null; validador?: string | null; ligar?: boolean }
}): ResultadoConfig {
  if (!e.podeEditar) return { ok: false, http: 403, erro: 'sem_permissao' }
  const c: ConfigLoop = {
    ativo: e.atual.ativo,
    baselinePct: e.novo.baselinePct !== undefined ? e.novo.baselinePct : e.atual.baselinePct,
    alvoPct: e.novo.alvoPct !== undefined ? e.novo.alvoPct : e.atual.alvoPct,
    janelaDias: e.novo.janelaDias !== undefined ? e.novo.janelaDias : e.atual.janelaDias,
    validador: e.novo.validador !== undefined ? e.novo.validador : e.atual.validador,
  }
  const faltam = faltaParaLigar(c)
  if (e.novo.ligar === true) {
    if (faltam.length > 0) return { ok: false, http: 422, erro: 'condicoes_nao_cumpridas', faltam }
    c.ativo = true
  }
  if (e.novo.ligar === false || faltam.length > 0) c.ativo = false
  return { ok: true, config: c }
}

export type ResultadoVeredito =
  | { ok: true; medicao: Medicao }
  | { ok: false; http: 403; erro: 'sem_permissao' }
  | { ok: false; http: 409; erro: 'loop_desligado' | 'medicao_pendente' | 'ja_congelada' | 'nao_aplicavel' }
  | { ok: false; http: 422; erro: 'dados_invalidos'; motivos: string[] }

export function registrarVeredito(e: {
  perfilTemAcao: boolean
  usuario: string
  config: ConfigLoop
  medicao: Medicao
  veredito: string
  texto?: string
  agora: Date
}): ResultadoVeredito {
  // só o validador indicado pelo cliente, com a ação validar_loop
  if (!e.perfilTemAcao || !e.config.validador || e.config.validador.trim().toLowerCase() !== e.usuario.trim().toLowerCase()) return { ok: false, http: 403, erro: 'sem_permissao' }
  if (!e.config.ativo) return { ok: false, http: 409, erro: 'loop_desligado' }
  if (e.medicao.congelada) return { ok: false, http: 409, erro: 'ja_congelada' }
  if (e.medicao.pendente) return { ok: false, http: 409, erro: 'medicao_pendente' }
  if (e.medicao.naoAplicavel) return { ok: false, http: 409, erro: 'nao_aplicavel' }
  if (e.veredito !== 'atingido' && e.veredito !== 'nao_atingido') return { ok: false, http: 422, erro: 'dados_invalidos', motivos: ['o veredito é "atingido" ou "não atingido"'] }
  return {
    ok: true,
    medicao: { ...e.medicao, veredito: e.veredito, vereditoPor: e.usuario, vereditoEm: e.agora.toISOString(), vereditoTexto: String(e.texto ?? '').trim() || null, congelada: true },
  }
}

/** A proporção só é comparada ao alvo para apoiar o validador; quem decide é a pessoa. */
export function sugestaoParaValidador(m: Medicao, alvoPct: number | null): string {
  if (m.pendente) return 'medição pendente'
  if (m.naoAplicavel) return 'não aplicável: nenhum alerta crítico no ciclo'
  if (alvoPct === null) return 'alvo ainda não definido'
  return (m.proporcaoPct as number) >= alvoPct ? 'proporção igual ou acima do alvo' : 'proporção abaixo do alvo'
}
