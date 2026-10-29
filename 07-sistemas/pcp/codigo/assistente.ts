/**
 * Assistente de consulta, somente leitura — SPEC-3-015, CA-3-41 e CA-3-42.
 *
 * O assistente usa a IA nativa do Skip com ferramentas que SÓ leem, cada uma exigindo a área do dado de
 * quem pergunta. Regras: pedido de ação (comprar, aprovar, publicar, liberar, enviar ao Omie, gravar) é
 * recusado antes de chamar a IA, com a tela certa; dado fora da área = "sem acesso", sem pistas; resposta
 * da IA precisa citar fonte e período e as fontes têm de ser ferramentas realmente consultadas, senão é
 * descartada ("não consegui responder com fonte"); sem dados, diz que não há e o que falta. O assistente
 * nunca executa nada: o que sugere é texto marcado como sugestão.
 */

export const ACAO_ASSISTENTE = 'consultar_assistente'

export type NomeFerramenta = 'consultar_alertas' | 'consultar_compras' | 'consultar_pedidos' | 'consultar_producao'

/** Área(s) de trabalho que liberam cada ferramenta. */
export const AREAS_DA_FERRAMENTA: Record<NomeFerramenta, string[]> = {
  consultar_alertas: ['planejamento', 'compras', 'faturamento'],
  consultar_compras: ['compras'],
  consultar_pedidos: ['faturamento'],
  consultar_producao: ['planejamento', 'apontar_producao'],
}

export interface PerfilAssistente {
  ativo: boolean
  areas: string[]
  acoes: string[]
}

export const podeUsar = (p: PerfilAssistente | null) => !!p && p.ativo && p.acoes.indexOf(ACAO_ASSISTENTE) !== -1

export const ferramentasPermitidas = (p: PerfilAssistente | null): NomeFerramenta[] =>
  !podeUsar(p) ? [] : (Object.keys(AREAS_DA_FERRAMENTA) as NomeFerramenta[]).filter((f) => AREAS_DA_FERRAMENTA[f].some((a) => p!.areas.indexOf(a) !== -1))

// ---- pedido de ação (RN-03) ----

const ACOES_RECUSADAS: { re: RegExp; acao: string; tela: string }[] = [
  { re: /\b(compre|comprem|comprar|solicite\s+(a\s+)?compra)\b/i, acao: 'comprar', tela: 'Compras > Requisições' },
  { re: /\b(aprove|aprovem|aprovar)\b/i, acao: 'aprovar', tela: 'Compras > Requisições (aprovação por alçada)' },
  { re: /\b(publique|publiquem|publicar)\b/i, acao: 'publicar', tela: 'Planejamento (publicação da programação)' },
  { re: /\b(libere|liberem|liberar)\b/i, acao: 'liberar', tela: 'Preparação de pedidos (liberar para faturar)' },
  { re: /\b(envie|enviem|enviar|mande|mandar)\b.*\bomie\b|\bomie\b.*\b(envie|enviar|grave|gravar)\b/i, acao: 'enviar ao Omie', tela: 'Envio ao Omie (autorização do dono)' },
  { re: /\b(grave|gravem|gravar|lance|lancem|lan[cç]ar)\b/i, acao: 'gravar ou lançar', tela: 'a tela de origem do dado (Compras, Preparação ou Envio ao Omie)' },
  { re: /\b(reprograme|reprogramar|cancele|cancelar|apague|apagar|exclua|excluir|altere|alterar|mude|mudar)\b/i, acao: 'alterar', tela: 'a tela de origem do dado' },
]

export function detectarPedidoDeAcao(pergunta: string): { acao: string; tela: string } | null {
  const t = String(pergunta ?? '')
  for (const a of ACOES_RECUSADAS) if (a.re.test(t)) return { acao: a.acao, tela: a.tela }
  return null
}

export const mensagemDeRecusa = (a: { acao: string; tela: string }) => 'O assistente só consulta e não executa: não consegue ' + a.acao + '. Faça isso em ' + a.tela + '.'

// ---- resultado das ferramentas e validação da resposta ----

export interface ResultadoFerramenta {
  ferramenta: NomeFerramenta
  acesso: boolean
  semDados?: boolean
  falta?: string
  fonte: string
  periodo: string
  atualizadoEm: string | null
  limites: string[]
  dados?: unknown
}

export interface RespostaIA {
  resposta: string
  fontes: { nome: string; periodo: string }[]
  sugestao: boolean
}

export const SEM_FONTE = 'não consegui responder com fonte'
export const SEM_ACESSO = 'sem acesso'

export type Resultado =
  | { tipo: 'respondida'; texto: string; fontes: { nome: string; periodo: string; atualizadoEm: string | null }[]; limites: string[]; sugestao: boolean }
  | { tipo: 'sem_acesso'; texto: string }
  | { tipo: 'acao_recusada'; texto: string; acao: string; tela: string }
  | { tipo: 'sem_dados'; texto: string; falta: string[] }
  | { tipo: 'sem_fonte'; texto: string }
  | { tipo: 'erro_ia'; texto: string }

export function interpretarResposta(bruta: string | null | undefined): RespostaIA | null {
  if (!bruta) return null
  const m = /\{[\s\S]*\}/.exec(bruta)
  if (!m) return null
  try {
    const j = JSON.parse(m[0])
    if (typeof j.resposta !== 'string' || !Array.isArray(j.fontes)) return null
    return { resposta: j.resposta, fontes: j.fontes.map((f: any) => ({ nome: String(f?.nome ?? ''), periodo: String(f?.periodo ?? '') })), sugestao: !!j.sugestao }
  } catch {
    return null
  }
}

export function validarResposta(r: RespostaIA | null, consultadas: ResultadoFerramenta[]): Resultado {
  if (!r || r.resposta.trim() === '') return { tipo: 'sem_fonte', texto: SEM_FONTE }
  const comAcesso = consultadas.filter((c) => c.acesso)
  if (comAcesso.length === 0) return { tipo: 'sem_fonte', texto: SEM_FONTE }
  const validas = r.fontes.filter((f) => f.nome && f.periodo && comAcesso.some((c) => c.fonte === f.nome))
  if (validas.length === 0) return { tipo: 'sem_fonte', texto: SEM_FONTE }
  const usadas = validas.map((f) => comAcesso.find((c) => c.fonte === f.nome)!)
  return {
    tipo: 'respondida',
    texto: (r.sugestao ? 'Sugestão (nada foi executado): ' : '') + r.resposta.trim(),
    fontes: validas.map((f, i) => ({ nome: f.nome, periodo: f.periodo, atualizadoEm: usadas[i].atualizadoEm })),
    limites: [...new Set(usadas.flatMap((u) => u.limites))],
    sugestao: r.sugestao,
  }
}

export interface Ia {
  /** Uma rodada: devolve o texto final ou pedidos de ferramenta. */
  conversar(entrada: { pergunta: string; ferramentas: NomeFerramenta[]; resultados: ResultadoFerramenta[] }): { texto?: string; pedirFerramentas?: NomeFerramenta[] } | 'indisponivel'
}

export type ExecutorFerramenta = (f: NomeFerramenta) => ResultadoFerramenta

/**
 * Orquestra uma pergunta. Ordem: pedido de ação → recusa (zero chamada à IA); sem a ação do assistente
 * → sem acesso; ferramentas só as permitidas pela área; nenhuma ferramenta permitida → sem acesso;
 * IA em até 4 rodadas; resposta validada contra as ferramentas realmente consultadas.
 */
export function responder(e: { pergunta: string; perfil: PerfilAssistente | null; ia: Ia; executar: ExecutorFerramenta }): { resultado: Resultado; ferramentasUsadas: NomeFerramenta[]; chamadasIA: number } {
  const acao = detectarPedidoDeAcao(e.pergunta)
  if (acao && podeUsar(e.perfil)) return { resultado: { tipo: 'acao_recusada', texto: mensagemDeRecusa(acao), ...acao }, ferramentasUsadas: [], chamadasIA: 0 }
  const permitidas = ferramentasPermitidas(e.perfil)
  if (permitidas.length === 0) return { resultado: { tipo: 'sem_acesso', texto: SEM_ACESSO }, ferramentasUsadas: [], chamadasIA: 0 }
  const resultados: ResultadoFerramenta[] = []
  let chamadas = 0
  for (let rodada = 0; rodada < 4; rodada++) {
    chamadas++
    const r = e.ia.conversar({ pergunta: e.pergunta, ferramentas: permitidas, resultados })
    if (r === 'indisponivel') return { resultado: { tipo: 'erro_ia', texto: 'O assistente está indisponível agora; as telas seguem funcionando.' }, ferramentasUsadas: resultados.map((x) => x.ferramenta), chamadasIA: chamadas }
    if (r.pedirFerramentas && r.pedirFerramentas.length > 0) {
      for (const f of r.pedirFerramentas) {
        if (resultados.some((x) => x.ferramenta === f)) continue
        // ferramenta fora da área: nunca executa, e a resposta não diz o que existe
        if (permitidas.indexOf(f) === -1) continue
        resultados.push(e.executar(f))
      }
      continue
    }
    const usadas = resultados.map((x) => x.ferramenta)
    if (resultados.length > 0 && resultados.every((x) => x.semDados)) {
      return { resultado: { tipo: 'sem_dados', texto: 'Não há dados suficientes para responder.', falta: resultados.map((x) => x.falta ?? 'dados do período') }, ferramentasUsadas: usadas, chamadasIA: chamadas }
    }
    return { resultado: validarResposta(interpretarResposta(r.texto), resultados.filter((x) => !x.semDados)), ferramentasUsadas: usadas, chamadasIA: chamadas }
  }
  return { resultado: { tipo: 'sem_fonte', texto: SEM_FONTE }, ferramentasUsadas: resultados.map((x) => x.ferramenta), chamadasIA: chamadas }
}
