/**
 * Tratamento dos alertas — SPEC-3-011, CA-3-33 e CA-3-34.
 *
 * Ciclo aberto → em análise → tratado. Assumir grava o responsável; tratar exige uma ação registrada
 * (com motivo ou texto quando a ação pede) e grava autor e hora. O histórico só recebe inclusões.
 * Cada área vê e trata só os seus alertas; alerta de outra área recebe a mesma recusa 403 de quem não
 * tem a ação. Desligar uma regra para de gerar alertas daquele tipo e não apaga nada. O sistema só
 * REGISTRA o tratamento: não compra, não reprograma e não executa a ação tratada.
 */
import type { AlertaGuardado, TipoAlerta } from './alertas.ts'

export const ACOES_ALERTA = ['tratar_alerta', 'editar_parametros'] as const
export type AreaAlerta = 'pcp' | 'compras' | 'faturamento'

/** Destinatário por tipo (SPEC-3-011): estoque, produção e divergência → PCP; compra e preço → Compras; pedido → faturamento. */
export const AREA_DO_TIPO: Record<TipoAlerta, AreaAlerta> = {
  estoque: 'pcp',
  producao: 'pcp',
  divergencia: 'pcp',
  compra: 'compras',
  preco: 'compras',
  pedido: 'faturamento',
}

/** Área de trabalho do perfil (`pcp_perfis.areas`) que corresponde a cada área de alerta. */
const AREA_DE_PERFIL: Record<AreaAlerta, string> = { pcp: 'planejamento', compras: 'compras', faturamento: 'faturamento' }

export interface PerfilAlerta {
  ativo: boolean
  areas: string[]
  acoes: string[]
}

/** Quem tem as três áreas é a gestão e vê todos os alertas (só vale para conta que a matriz aprovada permitir). */
export const ehGestao = (p: PerfilAlerta | null) => !!p && p.ativo && (['pcp', 'compras', 'faturamento'] as AreaAlerta[]).every((a) => p.areas.indexOf(AREA_DE_PERFIL[a]) !== -1)

export function veAlerta(p: PerfilAlerta | null, tipo: string): boolean {
  if (!p || !p.ativo) return false
  const area = AREA_DO_TIPO[tipo as TipoAlerta]
  if (!area) return false
  return ehGestao(p) || p.areas.indexOf(AREA_DE_PERFIL[area]) !== -1
}

export const podeTratar = (p: PerfilAlerta | null, tipo: string) => veAlerta(p, tipo) && p!.acoes.indexOf('tratar_alerta') !== -1

export const ACOES_DE_TRATAMENTO = ['compra_solicitada', 'ordem_reprogramada', 'fornecedor_contatado', 'pedido_liberado', 'risco_aceito', 'alerta_indevido', 'outra'] as const
export type AcaoTratamento = (typeof ACOES_DE_TRATAMENTO)[number]

export interface AlertaCiclo {
  id: string
  tipo: TipoAlerta
  estado: 'aberto' | 'em_analise' | 'tratado'
  versao: number
  responsavel: string | null
  anteriorId: string | null
}

export interface EventoHistorico {
  alertaId: string
  evento: 'assumido' | 'tratado' | 'regra_desligada' | 'regra_ligada'
  autor: string
  em: string
  detalhe: string
}

type Recusa = { ok: false; http: 403; erro: 'sem_permissao' } | { ok: false; http: 409; erro: 'conflito_de_versao' | 'estado_nao_permite' } | { ok: false; http: 422; erro: 'dados_invalidos'; motivos: string[] }
const NEGADO: Recusa = { ok: false, http: 403, erro: 'sem_permissao' }

export type ResultadoCiclo = { ok: true; alerta: AlertaCiclo; evento: EventoHistorico } | Recusa

export function assumir(e: { perfil: PerfilAlerta | null; usuario: string; alerta: AlertaCiclo; versaoEsperada: number; agora: Date }): ResultadoCiclo {
  if (!podeTratar(e.perfil, e.alerta.tipo)) return NEGADO
  if (e.alerta.versao !== e.versaoEsperada) return { ok: false, http: 409, erro: 'conflito_de_versao' }
  if (e.alerta.estado !== 'aberto') return { ok: false, http: 409, erro: 'estado_nao_permite' }
  return {
    ok: true,
    alerta: { ...e.alerta, estado: 'em_analise', responsavel: e.usuario, versao: e.alerta.versao + 1 },
    evento: { alertaId: e.alerta.id, evento: 'assumido', autor: e.usuario, em: e.agora.toISOString(), detalhe: '' },
  }
}

export function tratar(e: { perfil: PerfilAlerta | null; usuario: string; alerta: AlertaCiclo; versaoEsperada: number; acao: string | null; texto?: string; agora: Date }): ResultadoCiclo {
  if (!podeTratar(e.perfil, e.alerta.tipo)) return NEGADO
  if (e.alerta.versao !== e.versaoEsperada) return { ok: false, http: 409, erro: 'conflito_de_versao' }
  if (e.alerta.estado !== 'em_analise' || e.alerta.responsavel !== e.usuario) return { ok: false, http: 409, erro: 'estado_nao_permite' }
  const texto = String(e.texto ?? '').trim()
  const motivos: string[] = []
  if (!e.acao || (ACOES_DE_TRATAMENTO as readonly string[]).indexOf(e.acao) === -1) motivos.push('registre a ação tomada')
  else if (e.acao === 'alerta_indevido' && texto.length < 3) motivos.push('alerta indevido exige o motivo')
  else if (e.acao === 'outra' && texto.length < 3) motivos.push('descreva a ação')
  if (motivos.length > 0) return { ok: false, http: 422, erro: 'dados_invalidos', motivos }
  return {
    ok: true,
    alerta: { ...e.alerta, estado: 'tratado', versao: e.alerta.versao + 1 },
    evento: { alertaId: e.alerta.id, evento: 'tratado', autor: e.usuario, em: e.agora.toISOString(), detalhe: e.acao + (texto ? ': ' + texto : '') },
  }
}

/** Histórico só de inclusão: devolve uma lista nova com o evento no fim; nada é alterado ou removido. */
export const incluirNoHistorico = (h: EventoHistorico[], ev: EventoHistorico): EventoHistorico[] => [...h, ev]

export interface GrupoAlertas<T> {
  tipo: string
  item: string
  total: number
  gravidade: 'critico' | 'atencao'
  alertas: T[]
}

/** Alertas do mesmo tipo e item ficam juntos; o grupo leva a maior gravidade. */
export function agrupar<T extends { tipo: string; item: string; gravidade: 'critico' | 'atencao' }>(lista: T[]): GrupoAlertas<T>[] {
  const mapa = new Map<string, GrupoAlertas<T>>()
  for (const a of lista) {
    const k = a.tipo + '|' + a.item
    const g = mapa.get(k) ?? { tipo: a.tipo, item: a.item, total: 0, gravidade: 'atencao' as const, alertas: [] as T[] }
    g.total++
    g.alertas.push(a)
    if (a.gravidade === 'critico') g.gravidade = 'critico'
    mapa.set(k, g)
  }
  return [...mapa.values()]
}

/** Contador do menu: alertas ainda não tratados que a pessoa pode ver. */
export const contarAbertosVisiveis = (p: PerfilAlerta | null, lista: { tipo: string; estado: string }[]) => lista.filter((a) => a.estado !== 'tratado' && veAlerta(p, a.tipo)).length

// ---- regras ligadas e desligadas (RN-04) ----

export interface RegraAlerta {
  tipo: TipoAlerta
  ativa: boolean
  alteradaPor: string
  alteradaEm: string
}

export const regraAtiva = (regras: RegraAlerta[], tipo: string) => regras.find((r) => r.tipo === tipo)?.ativa !== false

export function mudarRegra(e: { perfil: PerfilAlerta | null; usuario: string; tipo: TipoAlerta; ativa: boolean; regras: RegraAlerta[]; agora: Date }):
  | { ok: true; regras: RegraAlerta[]; evento: EventoHistorico }
  | { ok: false; http: 403; erro: 'sem_permissao' } {
  if (!e.perfil || !e.perfil.ativo || e.perfil.acoes.indexOf('editar_parametros') === -1) return { ok: false, http: 403, erro: 'sem_permissao' }
  const nova: RegraAlerta = { tipo: e.tipo, ativa: e.ativa, alteradaPor: e.usuario, alteradaEm: e.agora.toISOString() }
  return {
    ok: true,
    regras: [...e.regras.filter((r) => r.tipo !== e.tipo), nova],
    evento: { alertaId: '', evento: e.ativa ? 'regra_ligada' : 'regra_desligada', autor: e.usuario, em: e.agora.toISOString(), detalhe: e.tipo },
  }
}

/** Desligar a regra para de gerar alertas do tipo; os já existentes e o histórico ficam como estão. */
export function filtrarGerados<T extends { tipo: string }>(gerados: T[], regras: RegraAlerta[]): T[] {
  return gerados.filter((g) => regraAtiva(regras, g.tipo))
}

export const ligadoAoAnterior = (a: AlertaGuardado) => a.anteriorOcorrencia !== null
