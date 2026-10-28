/**
 * Acessos de faturamento e expedição — SPEC-3-008, CA-3-23.
 *
 * Cinco ações novas numa área nova (`faturamento`), conferidas no servidor em CADA chamada: a ação
 * precisa estar no perfil E a área da ação também; área não concede ação por implicação. Perfil
 * ausente, inativo, sem a ação, sem a área ou ação inexistente recebem a mesma recusa (403), sem
 * pistas. Conta real só recebe ação nova pela matriz aprovada pelo dono (CL-003); a vigente não
 * está aprovada, então nenhuma conta real recebe nada.
 */
import type { MatrizAprovada } from './acoes-compras.ts'

export const ACOES_FATURAMENTO = [
  'consultar_faturamento',
  'editar_unidade',
  'preparar_pedido',
  'conferir_volumes',
  'liberar_faturamento',
] as const

export type AcaoFaturamento = (typeof ACOES_FATURAMENTO)[number]
export const AREA_FATURAMENTO = 'faturamento'

export interface PerfilFat {
  ativo: boolean
  areas: string[]
  acoes: string[]
}

export type GuardaFat = { permitido: true } | { permitido: false; http: 403; erro: 'sem_permissao' }
const NEGADO: GuardaFat = { permitido: false, http: 403, erro: 'sem_permissao' }

export function exigirAcaoFat(perfil: PerfilFat | null | undefined, acao: string): GuardaFat {
  if (!perfil || !perfil.ativo) return NEGADO
  if ((ACOES_FATURAMENTO as readonly string[]).indexOf(acao) === -1) return NEGADO
  if (!Array.isArray(perfil.acoes) || perfil.acoes.indexOf(acao) === -1) return NEGADO
  if (!Array.isArray(perfil.areas) || perfil.areas.indexOf(AREA_FATURAMENTO) === -1) return NEGADO
  return { permitido: true }
}

export function acoesFatConcedidas(perfil: PerfilFat | null | undefined): AcaoFaturamento[] {
  return ACOES_FATURAMENTO.filter((a) => exigirAcaoFat(perfil, a).permitido)
}

/** Matriz vigente para conta real: NÃO aprovada pelo dono (CL-003). */
export const MATRIZ_FATURAMENTO: MatrizAprovada = { aprovadaPeloDono: false, acoesAprovadas: [] }

export function contaRealPodeReceberFat(acao: string, matriz: MatrizAprovada = MATRIZ_FATURAMENTO): boolean {
  return matriz.aprovadaPeloDono === true && matriz.acoesAprovadas.indexOf(acao) !== -1
}

/** Perfis de teste (só para prova; nunca viram conta real). */
export const PERFIS_FAT_DE_TESTE: { [nome: string]: PerfilFat } = {
  faturamento: { ativo: true, areas: ['faturamento'], acoes: ['consultar_faturamento', 'editar_unidade', 'preparar_pedido'] },
  expedicao: { ativo: true, areas: ['faturamento'], acoes: ['consultar_faturamento', 'conferir_volumes'] },
  liberador: { ativo: true, areas: ['faturamento'], acoes: ['consultar_faturamento', 'liberar_faturamento'] },
}
