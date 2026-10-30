/**
 * LOOP-02: perguntas prioritárias respondidas com fonte — SPEC-3-017, CA-3-45 e CA-3-46.
 *
 * Medida do ciclo = perguntas prioritárias respondidas com fonte E período e aceitas pelo validador ÷
 * perguntas prioritárias feitas no ciclo. Ciclo sem prioritária feita: "não aplicável", nunca 100%.
 * Pergunta prioritária é a que a gestão cadastrou; a ligação da pergunta feita à prioritária é ESCOLHA da
 * pessoa ou do validador, nunca adivinhação. Aceite sem fonte ou período não conta. Recusa exige motivo.
 * O loop só mede, lembra e registra o veredito: não responde no lugar do assistente. Nasce desligado e só
 * liga com perguntas prioritárias, linha de base, alvo, janela e validador (CL-PEND-005). Congelamento e
 * veredito reaproveitam o LOOP-01 (`loop-alertas.ts`).
 */
import type { ConfigLoop, Medicao } from './loop-alertas.ts'
import { ehGestao, type PerfilAlerta } from './tratamento-alertas.ts'

export const LOOP2_ID = 'LOOP-02'

export interface Prioritaria {
  codigo: string
  texto: string
  area: 'pcp' | 'compras' | 'faturamento'
  ativa: boolean
  versao: number
  alteradaPor: string
}

type Recusa = { ok: false; http: 403; erro: 'sem_permissao' } | { ok: false; http: 422; erro: 'dados_invalidos'; motivos: string[] }
const NEGADO: Recusa = { ok: false, http: 403, erro: 'sem_permissao' }

/** Cadastro pela gestão. Cada alteração é uma versão nova; o texto antigo fica. */
export function salvarPrioritaria(e: {
  perfil: PerfilAlerta | null
  usuario: string
  codigo: string
  texto: string
  area: string
  ativa?: boolean
  existentes: Prioritaria[]
}): { ok: true; prioritaria: Prioritaria } | Recusa {
  if (!ehGestao(e.perfil)) return NEGADO
  const motivos: string[] = []
  const codigo = String(e.codigo ?? '').trim().toUpperCase()
  const texto = String(e.texto ?? '').trim()
  if (!/^[A-Z0-9-]{1,20}$/.test(codigo)) motivos.push('código curto (letras, números e hífen)')
  if (texto.length < 5) motivos.push('escreva a pergunta')
  if (['pcp', 'compras', 'faturamento'].indexOf(e.area) === -1) motivos.push('escolha a área')
  if (motivos.length > 0) return { ok: false, http: 422, erro: 'dados_invalidos', motivos }
  const versao = e.existentes.filter((p) => p.codigo === codigo).reduce((m, p) => Math.max(m, p.versao), 0) + 1
  return { ok: true, prioritaria: { codigo, texto, area: e.area as Prioritaria['area'], ativa: e.ativa !== false, versao, alteradaPor: e.usuario } }
}

export function vigentes(todas: Prioritaria[]): Prioritaria[] {
  const m = new Map<string, Prioritaria>()
  for (const p of todas) if (!m.has(p.codigo) || p.versao > m.get(p.codigo)!.versao) m.set(p.codigo, p)
  return [...m.values()]
}

export interface PerguntaFeita {
  id: string
  usuario: string
  criadaEm: string
  resultado: 'respondida' | 'sem_acesso' | 'acao_recusada' | 'sem_dados' | 'sem_fonte' | 'erro_ia'
  fontes: { nome: string; periodo: string }[]
}

/** Tem fonte e período só a pergunta respondida com ao menos uma fonte que traga nome e período. */
export const temFontePeriodo = (p: PerguntaFeita) => p.resultado === 'respondida' && p.fontes.some((f) => !!f.nome && !!f.periodo)

export interface Revisao {
  perguntaId: string
  prioritaria: string | null
  ligadaPor: string | null
  aceita: boolean | null
  motivo: string | null
  validador: string | null
  revisadoEm: string | null
}

/** Ligação pela escolha: quem fez a pergunta ou o validador. Prioritária inexistente ou inativa é recusada. */
export function ligar(e: {
  perfil: PerfilAlerta | null
  usuario: string
  pergunta: PerguntaFeita
  codigo: string
  prioritarias: Prioritaria[]
  revisoes: Revisao[]
}): { ok: true; revisao: Revisao } | Recusa | { ok: false; http: 409; erro: 'ja_revisada' } {
  const ehValidador = !!e.perfil && e.perfil.ativo && e.perfil.acoes.indexOf('validar_loop') !== -1
  const ehDono = e.pergunta.usuario.toLowerCase() === e.usuario.toLowerCase()
  if (!e.perfil || !e.perfil.ativo || !(ehValidador || ehDono)) return NEGADO
  const p = vigentes(e.prioritarias).find((x) => x.codigo === String(e.codigo).trim().toUpperCase())
  if (!p || !p.ativa) return { ok: false, http: 422, erro: 'dados_invalidos', motivos: ['escolha uma pergunta prioritária ativa'] }
  const ja = e.revisoes.find((r) => r.perguntaId === e.pergunta.id)
  if (ja && ja.aceita !== null) return { ok: false, http: 409, erro: 'ja_revisada' }
  return { ok: true, revisao: { perguntaId: e.pergunta.id, prioritaria: p.codigo, ligadaPor: e.usuario, aceita: null, motivo: null, validador: null, revisadoEm: null } }
}

/** Revisão do validador: aceita ou recusa com motivo. Uma revisão por pergunta feita. */
export function revisar(e: {
  perfilTemAcao: boolean
  usuario: string
  config: ConfigLoop
  revisao: Revisao | null
  aceita: boolean
  motivo?: string
  agora: Date
}): { ok: true; revisao: Revisao } | Recusa | { ok: false; http: 409; erro: 'sem_ligacao' | 'ja_revisada' } {
  if (!e.perfilTemAcao || !e.config.validador || e.config.validador.trim().toLowerCase() !== e.usuario.trim().toLowerCase()) return NEGADO
  if (!e.revisao || !e.revisao.prioritaria) return { ok: false, http: 409, erro: 'sem_ligacao' }
  if (e.revisao.aceita !== null) return { ok: false, http: 409, erro: 'ja_revisada' }
  const motivo = String(e.motivo ?? '').trim()
  if (!e.aceita && motivo.length < 3) return { ok: false, http: 422, erro: 'dados_invalidos', motivos: ['a recusa exige o motivo'] }
  return { ok: true, revisao: { ...e.revisao, aceita: e.aceita, motivo: motivo || null, validador: e.usuario, revisadoEm: e.agora.toISOString() } }
}

/** Medida do ciclo. Feitas = perguntas LIGADAS a uma prioritária no ciclo; aceitas = revisão aceita E com fonte e período. */
export function medirPerguntas(e: {
  cicloInicio: string
  cicloFim: string
  perguntas: PerguntaFeita[]
  revisoes: Revisao[]
  fonteCompleta: boolean
  agora: Date
}): Medicao {
  const base = { loop: LOOP2_ID, cicloInicio: e.cicloInicio, cicloFim: e.cicloFim, veredito: null, vereditoPor: null, vereditoEm: null, vereditoTexto: null, congelada: false, calculadoEm: e.agora.toISOString() } as const
  if (!e.fonteCompleta) return { ...base, gerados: 0, tratados: 0, proporcaoPct: null, naoAplicavel: false, pendente: true, motivoPendente: 'fonte incompleta: a medição espera a próxima rodada' }
  const ini = new Date(e.cicloInicio).getTime()
  const fim = new Date(e.cicloFim).getTime()
  const feitas = e.perguntas.filter((p) => {
    const t = new Date(p.criadaEm).getTime()
    const r = e.revisoes.find((x) => x.perguntaId === p.id)
    return t >= ini && t <= fim && !!r && !!r.prioritaria
  })
  if (feitas.length === 0) return { ...base, gerados: 0, tratados: 0, proporcaoPct: null, naoAplicavel: true, pendente: false, motivoPendente: null }
  const aceitas = feitas.filter((p) => e.revisoes.find((x) => x.perguntaId === p.id)!.aceita === true && temFontePeriodo(p))
  return { ...base, gerados: feitas.length, tratados: aceitas.length, proporcaoPct: Math.round((aceitas.length / feitas.length) * 10000) / 100, naoAplicavel: false, pendente: false, motivoPendente: null }
}

/** Condições para ligar o LOOP-02: as do LOOP-01 mais ao menos uma pergunta prioritária ativa. */
export function faltaParaLigarLoop2(c: ConfigLoop, prioritariasAtivas: number): string[] {
  const f: string[] = []
  if (prioritariasAtivas < 1) f.push('perguntas prioritárias')
  if (c.baselinePct === null || !Number.isFinite(c.baselinePct) || c.baselinePct < 0 || c.baselinePct > 100) f.push('linha de base')
  if (c.alvoPct === null || !Number.isFinite(c.alvoPct) || c.alvoPct <= 0 || c.alvoPct > 100) f.push('alvo')
  if (c.janelaDias === null || !Number.isInteger(c.janelaDias) || c.janelaDias < 1 || c.janelaDias > 366) f.push('janela')
  if (!c.validador || !String(c.validador).trim()) f.push('validador')
  return f
}

export function ligarLoop2(e: { podeEditar: boolean; config: ConfigLoop; prioritariasAtivas: number }): { ok: true; config: ConfigLoop } | { ok: false; http: 403; erro: 'sem_permissao' } | { ok: false; http: 422; erro: 'condicoes_nao_cumpridas'; faltam: string[] } {
  if (!e.podeEditar) return { ok: false, http: 403, erro: 'sem_permissao' }
  const faltam = faltaParaLigarLoop2(e.config, e.prioritariasAtivas)
  if (faltam.length > 0) return { ok: false, http: 422, erro: 'condicoes_nao_cumpridas', faltam }
  return { ok: true, config: { ...e.config, ativo: true } }
}
