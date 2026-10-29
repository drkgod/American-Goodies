/**
 * Exportação dos dados complementares e conferência de recuperação — SPEC-3-016, CA-3-43 e CA-3-44.
 *
 * Pacote = um CSV por coleção complementar + um resumo (coleção, registros, data, versão do sistema),
 * identificado como dados da American Goodies. Sem segredo, senha ou chave: colunas sensíveis saem do
 * CSV e uma varredura procura os valores dos segredos conhecidos e padrões de credencial; achou, a
 * coleção sai do pacote e o pacote fica marcado incompleto. Só `exportar_dados` exporta (403 sem
 * pistas). A restauração é SEMPRE em ambiente separado e a prova compara as contagens por coleção.
 */
import { paraCsv } from './relatorios.ts'

export const ACAO_EXPORTAR = 'exportar_dados'
export const IDENTIFICACAO = 'Dados da American Goodies (propriedade do cliente)'

/** Coleções complementares (as que só existem no sistema). A ordem do resumo é esta. */
export const COLECOES_COMPLEMENTARES = [
  'pcp_perfis', 'pcp_parametros', 'pcp_chaves_escrita', 'pcp_transacoes_omie',
  'pcp_fornecedores_complemento', 'pcp_conversoes', 'pcp_excecoes_compra', 'pcp_precos_compra',
  'pcp_requisicoes', 'pcp_requisicao_origens', 'pcp_cotacoes', 'pcp_aprovacoes_compra', 'pcp_alcadas',
  'pcp_entregas_compra', 'pcp_pedidos_compra_vinculo', 'pcp_recebimentos', 'pcp_parcelas_compra', 'pcp_notas_demo',
  'pcp_unidades', 'pcp_nomes_canal', 'pcp_tabelas_preco',
  'pcp_preparacao_pedido', 'pcp_volumes', 'pcp_pedidos_manuais', 'pcp_liberacoes_faturamento', 'pcp_gravacoes_venda',
  'pcp_parametros_alerta', 'pcp_familias', 'pcp_alertas', 'pcp_alertas_lacunas', 'pcp_alertas_historico', 'pcp_alertas_regras',
  'pcp_historico_vendas_periodo', 'pcp_historico_vendas_cobertura', 'pcp_regra_sazonalidade',
  'pcp_loop_config', 'pcp_loop_medicoes', 'pcp_assistente_perguntas',
] as const

/** Cópias das leituras do Omie e da Nuvemshop: recuperáveis relendo a fonte; entram só como contagem no resumo. */
export const COLECOES_DE_LEITURA = ['pcp_dados', 'pcp_lotes', 'pcp_fontes', 'pcp_execucoes'] as const

const SENSIVEL = /(^|_)(password|passwordhash|senha|secret|segredo|token|tokenkey|apikey|api_key|app_key|app_secret|chave_api)($|_)/i
export const campoSensivel = (nome: string) => SENSIVEL.test(nome)

const PADROES_DE_CREDENCIAL = [
  /\bapp_(key|secret)\b/i,
  /\bapi[_-]?key\b/i,
  /\bpassword\b/i,
  /\bbearer\s+[a-z0-9._-]{16,}/i,
  /\b[a-z0-9_-]{20,}\.[a-z0-9_-]{20,}\.[a-z0-9_-]{20,}\b/i, // JWT
]

/** Procura os segredos conhecidos (valores exatos) e padrões de credencial no texto. Devolve o que achou, sem repetir o valor. */
export function varrerSegredos(texto: string, valoresSecretos: string[]): string[] {
  const achados: string[] = []
  for (const v of valoresSecretos) if (v && v.length >= 6 && texto.indexOf(v) !== -1) achados.push('valor de segredo conhecido')
  for (const re of PADROES_DE_CREDENCIAL) if (re.test(texto)) achados.push('padrão de credencial: ' + re.source.slice(0, 24))
  return achados
}

export interface LinhaResumo {
  colecao: string
  registros: number
  exportada: boolean
  motivo: string | null
}
export interface Resumo {
  identificacao: string
  geradoEm: string
  versaoSistema: string
  completo: boolean
  linhas: LinhaResumo[]
}

export type ResultadoAcesso = { ok: true } | { ok: false; http: 403; erro: 'sem_permissao' }
export function autorizarExportacao(perfil: { ativo: boolean; acoes: string[] } | null): ResultadoAcesso {
  if (!perfil || !perfil.ativo || perfil.acoes.indexOf(ACAO_EXPORTAR) === -1) return { ok: false, http: 403, erro: 'sem_permissao' }
  return { ok: true }
}

export interface Exportacao {
  csv: { [colecao: string]: string }
  resumo: Resumo
}

/**
 * Monta o pacote a partir das coleções já lidas. `falhas` são coleções que não puderam ser lidas.
 * Coleção vazia entra com zero registros; coleção com segredo ou falha sai do pacote e o marca incompleto.
 */
export function montarPacote(e: {
  colecoes: { [nome: string]: { campos: string[]; registros: (string | number | boolean | null)[][] } }
  falhas?: { [nome: string]: string }
  contagemLeituras: { [nome: string]: number }
  segredos: string[]
  versaoSistema: string
  agora: Date
}): Exportacao {
  const csv: { [c: string]: string } = {}
  const linhas: LinhaResumo[] = []
  for (const nome of COLECOES_COMPLEMENTARES) {
    if (e.falhas && e.falhas[nome]) {
      linhas.push({ colecao: nome, registros: 0, exportada: false, motivo: 'falha na leitura: ' + e.falhas[nome] })
      continue
    }
    const c = e.colecoes[nome]
    if (!c) {
      linhas.push({ colecao: nome, registros: 0, exportada: false, motivo: 'coleção não encontrada' })
      continue
    }
    const idx = c.campos.map((f, i) => (campoSensivel(f) ? -1 : i)).filter((i) => i >= 0)
    const cab = idx.map((i) => c.campos[i])
    const corpo = c.registros.map((r) => idx.map((i) => (typeof r[i] === 'boolean' ? (r[i] ? 'true' : 'false') : (r[i] as string | number | null))))
    const texto = paraCsv(cab, corpo)
    const achados = varrerSegredos(texto, e.segredos)
    if (achados.length > 0) {
      linhas.push({ colecao: nome, registros: c.registros.length, exportada: false, motivo: 'retirada do pacote: ' + achados[0] })
      continue
    }
    csv[nome] = texto
    linhas.push({ colecao: nome, registros: c.registros.length, exportada: true, motivo: null })
  }
  for (const nome of COLECOES_DE_LEITURA) {
    linhas.push({ colecao: nome, registros: e.contagemLeituras[nome] ?? 0, exportada: false, motivo: 'cópia das leituras do Omie/Nuvemshop: recuperável relendo a fonte; só a contagem entra' })
  }
  const completo = linhas.filter((l) => (COLECOES_COMPLEMENTARES as readonly string[]).indexOf(l.colecao) !== -1).every((l) => l.exportada)
  return { csv, resumo: { identificacao: IDENTIFICACAO, geradoEm: e.agora.toISOString(), versaoSistema: e.versaoSistema, completo, linhas } }
}

export const resumoParaCsv = (r: Resumo) =>
  paraCsv(['coleção', 'registros', 'exportada', 'observação', 'gerado em', 'versão do sistema'], r.linhas.map((l) => [l.colecao, l.registros, l.exportada ? 'sim' : 'não', l.motivo, r.geradoEm, r.versaoSistema]))

export interface ProvaRestauracao {
  ok: boolean
  diferencas: { colecao: string; origem: number; restaurado: number | null }[]
}

/** Contagens da origem × contagens do ambiente separado; coleção faltando ou com outra contagem reprova e é apontada. */
export function conferirRestauracao(origem: Resumo, restaurado: { [colecao: string]: number }): ProvaRestauracao {
  const diferencas: ProvaRestauracao['diferencas'] = []
  for (const l of origem.linhas) {
    if (!l.exportada) continue
    const r = Object.prototype.hasOwnProperty.call(restaurado, l.colecao) ? restaurado[l.colecao] : null
    if (r === null || r !== l.registros) diferencas.push({ colecao: l.colecao, origem: l.registros, restaurado: r })
  }
  return { ok: diferencas.length === 0, diferencas }
}

/** Restauração nunca é feita por cima da produção: o ambiente de destino não pode ser o de origem. */
export function destinoPermitido(origemUrl: string, destinoUrl: string): boolean {
  const n = (u: string) => String(u ?? '').trim().toLowerCase().replace(/\/+$/, '')
  return !!n(destinoUrl) && n(origemUrl) !== n(destinoUrl)
}
