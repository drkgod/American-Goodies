export type OperacaoOmie = 'incluir_op' | 'concluir_op'
export type EstadoTransacao =
  | 'preparada'
  | 'autorizada'
  | 'enviando'
  | 'resultado_incerto'
  | 'confirmada'
  | 'falhou_sem_efeito'
  | 'bloqueada'

export interface Transacao {
  transacao_id: string
  op_id: string
  revisao_consolidacao: number
  operacao: OperacaoOmie
  codigo_integracao: string
  quantidade: number
  payload_hash: string | null
  estado: EstadoTransacao
  lease_ate: string | null
  posts_mutantes: number
  pendencias: string[]
}

export type AprovacaoPayload = { payload_hash: string; aprovador: string }

export type ResultadoPreparar =
  | { estado: 'preparada'; transacao: Transacao }
  | { estado: 'bloqueada'; transacao: Transacao; motivo: string }

export function prepararTransacao(entrada: {
  transacao_id: string
  op_id: string
  revisao_consolidacao: number
  operacao: OperacaoOmie
  codigo_integracao: string
  quantidade: number
}): ResultadoPreparar {
  const base: Transacao = {
    ...entrada,
    payload_hash: null,
    estado: 'preparada',
    lease_ate: null,
    posts_mutantes: 0,
    pendencias: [],
  }
  if (!Number.isFinite(entrada.quantidade) || entrada.quantidade <= 0) {
    return {
      estado: 'bloqueada',
      transacao: {
        ...base,
        estado: 'bloqueada',
        pendencias: [
          'Quantidade final 0 ou inválida — inclusão/conclusão mutante negada; pendência para decisão do PCP (O1/T6).',
        ],
      },
      motivo:
        'Quantidade final 0 ou inválida: nada é enviado ao ERP; ocorrência local preservada para decisão do PCP.',
    }
  }
  return { estado: 'preparada', transacao: base }
}

export function autorizarPayload(
  t: Transacao,
  aprovacao: AprovacaoPayload,
  payloadAtual: unknown,
): Transacao {
  const hashAtual = JSON.stringify(payloadAtual)
  if (aprovacao.payload_hash !== hashAtual) {
    return {
      ...t,
      estado: 'bloqueada',
      pendencias: [
        ...t.pendencias,
        'Payload alterado após aprovação — hash divergente; aprovação invalidada (O2/T1).',
      ],
    }
  }
  return { ...t, estado: 'autorizada', payload_hash: aprovacao.payload_hash }
}

export type AdapterMock = {
  enviar: (payload: unknown) => { respostaChegou: boolean; efeitoAplicado: boolean }
}

export type ResultadoEnvio =
  | { estado: 'confirmada'; transacao: Transacao }
  | { estado: 'resultado_incerto'; transacao: Transacao }
  | { estado: 'negado'; motivo: string }

export function enviarComAquisicao(
  t: Transacao,
  payload: unknown,
  adapter: AdapterMock,
  agora: Date,
  leaseMs: number,
  temLease: boolean,
): ResultadoEnvio {
  if (t.estado !== 'autorizada') {
    return {
      estado: 'negado',
      motivo: `Envio negado: transação em estado ${t.estado} — só autorizada envia (O3).`,
    }
  }
  if (t.payload_hash !== null && JSON.stringify(payload) !== t.payload_hash) {
    return {
      estado: 'negado',
      motivo:
        'Envio negado: payload divergente do hash aprovado (O2/T1) — aprovação invalidada; zero POST.',
    }
  }
  if (!temLease) {
    return {
      estado: 'negado',
      motivo:
        'Aquisição falhou: outro trabalhador detém o lease desta OP/revisão/operação (O3/T2) — leia o estado, não envie.',
    }
  }
  const lease_ate = new Date(agora.getTime() + leaseMs).toISOString()
  const enviando: Transacao = {
    ...t,
    estado: 'enviando',
    lease_ate,
    posts_mutantes: t.posts_mutantes + 1,
  }
  const r = adapter.enviar(payload)
  if (!r.respostaChegou) {
    return { estado: 'resultado_incerto', transacao: { ...enviando, estado: 'resultado_incerto' } }
  }
  if (!r.efeitoAplicado) {
    return {
      estado: 'negado',
      motivo: 'Falha sem efeito comprovada pelo adapter (sem POST aceito).',
    }
  }
  return { estado: 'confirmada', transacao: { ...enviando, estado: 'confirmada' } }
}

export function reconciliarPorConsulta(
  t: Transacao,
  consulta: { encontrou: boolean; quantidade: number | null },
): { estado: EstadoTransacao; transacao: Transacao; novoPostAutorizado: false } {
  if (t.estado === 'resultado_incerto' || t.estado === 'enviando') {
    if (consulta.encontrou && consulta.quantidade === t.quantidade) {
      return {
        estado: 'confirmada',
        transacao: { ...t, estado: 'confirmada', posts_mutantes: t.posts_mutantes },
        novoPostAutorizado: false,
      }
    }
    return {
      estado: 'resultado_incerto',
      transacao: {
        ...t,
        pendencias: [
          ...t.pendencias,
          'Consulta inconclusiva — ausência não prova ausência de efeito; sem retry automático (O4/T4).',
        ],
      },
      novoPostAutorizado: false,
    }
  }
  return { estado: t.estado, transacao: t, novoPostAutorizado: false }
}

export const OP_FILA_DEMO = {
  op_id: 'OP-S-2-005',
  revisao_consolidacao: 1,
  codigo_integracao: 'AG-OP-S-2-005-1',
}

export const PAYLOAD_DEMO = { op: 'OP-S-2-005', quantidade: 100, operacao: 'concluir_op' }
