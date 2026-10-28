/**
 * Pedido pronto para faturar — SPEC-3-009, CA-3-26 a CA-3-29.
 *
 * Frete por pedido (sem padrão), volumes contados pela expedição (sem cubagem), fila apto/bloqueado
 * com motivos, liberação com autor e hora, pedido manual com checagem de duplicata e gravação no
 * Omie atrás da chave `omie_pedido_venda_escrita` (desligada), provada com simulador. Mudança depois
 * da liberação a desfaz. O sistema não emite nem transmite nota fiscal.
 */
import { exigirAcaoFat, type PerfilFat } from './acoes-faturamento.ts'
import type { AnalisePedido } from './unidades.ts'

export const CHAVE_PEDIDO_VENDA = 'omie_pedido_venda_escrita'
export const MENSAGEM_VENDA_DESLIGADA = 'gravação no Omie desligada: aguarda autorização do dono; lance à mão com os dados da tela'

/** Modalidades do frete (códigos da nota). Nenhuma é padrão: FOB visto num pedido não vale para os outros. */
export const MODALIDADES_FRETE = ['CIF', 'FOB', 'TERCEIROS', 'PROPRIO_REMETENTE', 'PROPRIO_DESTINATARIO', 'SEM_FRETE'] as const
export type ModalidadeFrete = (typeof MODALIDADES_FRETE)[number]

export interface Frete {
  modalidade: ModalidadeFrete
  transportadora: string
}
export interface Volumes {
  quantidade: number
  pesoBruto: number | null
  conferidoPor: string
  conferidoEm: string
}
export interface Liberacao {
  hash: string
  por: string
  em: string
}
export type DecisaoDuplicata = { decisao: 'nao_e_duplicata' | 'e_duplicata'; motivo: string; por: string; em: string }

export interface Preparacao {
  pedidoId: string
  versao: number
  frete: Frete | null
  volumes: Volumes | null
  liberacao: Liberacao | null
  decisaoDuplicata: DecisaoDuplicata | null
}

export const preparacaoVazia = (pedidoId: string): Preparacao => ({
  pedidoId,
  versao: 0,
  frete: null,
  volumes: null,
  liberacao: null,
  decisaoDuplicata: null,
})

type Recusa403 = { ok: false; http: 403; erro: 'sem_permissao' }
type RecusaVersao = { ok: false; http: 409; erro: 'versao_desatualizada' }
type Recusa422 = { ok: false; http: 422; erro: 'dados_invalidos'; motivos: string[] }
export type ResultadoPrep =
  | { ok: true; preparacao: Preparacao; liberacaoDesfeita: boolean }
  | Recusa403
  | RecusaVersao
  | Recusa422

const NEG: Recusa403 = { ok: false, http: 403, erro: 'sem_permissao' }

function proxima(p: Preparacao, mudanca: Partial<Preparacao>): { preparacao: Preparacao; liberacaoDesfeita: boolean } {
  // qualquer mudança depois da liberação desfaz a liberação (CA-3-27)
  return {
    preparacao: { ...p, ...mudanca, liberacao: null, versao: p.versao + 1 },
    liberacaoDesfeita: p.liberacao !== null,
  }
}

/** Frete do pedido: precisa de ação `preparar_pedido` e de uma modalidade escolhida (nunca assumida). */
export function definirFrete(e: {
  perfil: PerfilFat | null
  atual: Preparacao
  versaoEsperada: number
  modalidade: string | null
  transportadora?: string
}): ResultadoPrep {
  if (!exigirAcaoFat(e.perfil, 'preparar_pedido').permitido) return NEG
  if (e.atual.versao !== e.versaoEsperada) return { ok: false, http: 409, erro: 'versao_desatualizada' }
  if (!e.modalidade || (MODALIDADES_FRETE as readonly string[]).indexOf(e.modalidade) === -1) {
    return { ok: false, http: 422, erro: 'dados_invalidos', motivos: ['escolha a modalidade de frete do pedido'] }
  }
  const frete: Frete = { modalidade: e.modalidade as ModalidadeFrete, transportadora: String(e.transportadora ?? '').trim() }
  return { ok: true, ...proxima(e.atual, { frete }) }
}

/** Volumes: contagem física da expedição (`conferir_volumes`). Sem cubagem: só quantidade e, se pesado, o peso. */
export function contarVolumes(e: {
  perfil: PerfilFat | null
  usuario: string
  atual: Preparacao
  versaoEsperada: number
  quantidade: number
  pesoBruto?: number | null
  agora: Date
}): ResultadoPrep {
  if (!exigirAcaoFat(e.perfil, 'conferir_volumes').permitido) return NEG
  if (e.atual.versao !== e.versaoEsperada) return { ok: false, http: 409, erro: 'versao_desatualizada' }
  const motivos: string[] = []
  if (!Number.isInteger(e.quantidade) || e.quantidade < 1 || e.quantidade > 9999) {
    motivos.push('a quantidade de volumes precisa ser um número inteiro de 1 a 9999')
  }
  const peso = e.pesoBruto ?? null
  if (peso !== null && (!Number.isFinite(peso) || peso <= 0)) motivos.push('peso, se informado, precisa ser maior que zero')
  if (motivos.length > 0) return { ok: false, http: 422, erro: 'dados_invalidos', motivos }
  const volumes: Volumes = { quantidade: e.quantidade, pesoBruto: peso, conferidoPor: e.usuario, conferidoEm: e.agora.toISOString() }
  return { ok: true, ...proxima(e.atual, { volumes }) }
}

// ---- Duplicata (CA-3-28, RQ-005) ----

export interface PedidoParaDuplicata {
  pedidoId: string
  clienteOmie: string
  data: string
  referencia: string | null
  itens: { item: string; quantidade: number }[]
}
export type SituacaoDuplicata =
  | { situacao: 'nenhuma' }
  | { situacao: 'duplicata'; comOutro: string; motivo: string }
  | { situacao: 'possivel'; comOutro: string; motivo: string }

const norm = (c: string | null | undefined) => String(c ?? '').trim().toUpperCase()
const assinaturaItens = (p: PedidoParaDuplicata) =>
  p.itens
    .map((i) => norm(i.item) + 'x' + i.quantidade)
    .sort()
    .join('|')

/**
 * Duplicata só por referência comprovada (código de integração ou número do canal). Pedido parecido
 * (mesmo cliente, data e itens, sem referência que o distinga) vai para revisão. Nunca junta por
 * cliente e valor: o valor nem entra na conta.
 */
export function verificarDuplicata(pedido: PedidoParaDuplicata, outros: PedidoParaDuplicata[]): SituacaoDuplicata {
  const ref = norm(pedido.referencia)
  const demais = outros.filter((o) => o.pedidoId !== pedido.pedidoId)
  if (ref) {
    const mesmo = demais.find((o) => norm(o.referencia) === ref)
    if (mesmo) return { situacao: 'duplicata', comOutro: mesmo.pedidoId, motivo: 'mesma referência do pedido ' + mesmo.pedidoId }
  }
  const parecido = demais.find(
    (o) =>
      norm(o.clienteOmie) === norm(pedido.clienteOmie) &&
      o.data === pedido.data &&
      assinaturaItens(o) === assinaturaItens(pedido) &&
      (!ref || !norm(o.referencia) || norm(o.referencia) === ref),
  )
  if (parecido) {
    return { situacao: 'possivel', comOutro: parecido.pedidoId, motivo: 'mesmo cliente, data e itens do pedido ' + parecido.pedidoId + ', sem referência que os distinga' }
  }
  return { situacao: 'nenhuma' }
}

/** Faturamento decide a possível duplicata, com motivo. Duplicata comprovada por referência não se decide. */
export function decidirDuplicata(e: {
  perfil: PerfilFat | null
  usuario: string
  atual: Preparacao
  situacao: SituacaoDuplicata
  decisao: 'nao_e_duplicata' | 'e_duplicata'
  motivo: string
  agora: Date
}): ResultadoPrep {
  if (!exigirAcaoFat(e.perfil, 'preparar_pedido').permitido) return NEG
  if (e.situacao.situacao !== 'possivel') {
    return { ok: false, http: 422, erro: 'dados_invalidos', motivos: ['só a possível duplicata pode ser decidida'] }
  }
  const motivo = String(e.motivo ?? '').trim()
  if (motivo.length < 3) return { ok: false, http: 422, erro: 'dados_invalidos', motivos: ['informe o motivo da decisão'] }
  const d: DecisaoDuplicata = { decisao: e.decisao, motivo, por: e.usuario, em: e.agora.toISOString() }
  return { ok: true, ...proxima(e.atual, { decisaoDuplicata: d }) }
}

// ---- Pedido manual (CA-3-28) ----

export interface PedidoManual extends PedidoParaDuplicata {
  origem: 'manual'
  motivo: string
  codigoIntegracao: string
  criadoPor: string
  criadoEm: string
  estado: 'registrado' | 'bloqueado_duplicata' | 'a_revisar'
}

export type ResultadoManual =
  | { ok: true; pedido: PedidoManual; duplicata: SituacaoDuplicata }
  | Recusa403
  | Recusa422

export function criarPedidoManual(e: {
  perfil: PerfilFat | null
  usuario: string
  pedidoId: string
  clienteOmie: string
  data: string
  itens: { item: string; quantidade: number }[]
  motivo: string
  referencia?: string | null
  existentes: PedidoParaDuplicata[]
  agora: Date
}): ResultadoManual {
  if (!exigirAcaoFat(e.perfil, 'preparar_pedido').permitido) return NEG
  const motivos: string[] = []
  if (!String(e.clienteOmie ?? '').trim()) motivos.push('cliente obrigatório')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(e.data ?? ''))) motivos.push('data inválida')
  if (!Array.isArray(e.itens) || e.itens.length === 0) motivos.push('o pedido precisa de ao menos um item')
  for (const i of e.itens ?? []) {
    if (!norm(i.item) || !Number.isFinite(i.quantidade) || i.quantidade <= 0) motivos.push('item e quantidade maior que zero são obrigatórios')
  }
  if (String(e.motivo ?? '').trim().length < 3) motivos.push('informe por que o pedido é manual (e-mail, WhatsApp…)')
  if (motivos.length > 0) return { ok: false, http: 422, erro: 'dados_invalidos', motivos }
  const base: PedidoParaDuplicata = {
    pedidoId: e.pedidoId,
    clienteOmie: String(e.clienteOmie).trim(),
    data: e.data,
    referencia: String(e.referencia ?? '').trim() || null,
    itens: e.itens.map((i) => ({ item: norm(i.item), quantidade: i.quantidade })),
  }
  const duplicata = verificarDuplicata(base, e.existentes)
  const estado = duplicata.situacao === 'duplicata' ? 'bloqueado_duplicata' : duplicata.situacao === 'possivel' ? 'a_revisar' : 'registrado'
  return {
    ok: true,
    duplicata,
    pedido: {
      ...base,
      origem: 'manual',
      motivo: String(e.motivo).trim(),
      codigoIntegracao: 'MAN-' + e.pedidoId,
      criadoPor: e.usuario,
      criadoEm: e.agora.toISOString(),
      estado,
    },
  }
}

// ---- Fila apto / bloqueado e liberação (CA-3-26, CA-3-27) ----

export type EstadoFila = 'bloqueado' | 'apto' | 'liberado'
export interface AvaliacaoFila {
  estado: EstadoFila
  motivos: string[]
}

export function avaliarPedido(e: {
  analise: AnalisePedido
  preparacao: Preparacao
  duplicata: SituacaoDuplicata
  hashAtual: string
}): AvaliacaoFila {
  const motivos: string[] = [...e.analise.motivos]
  if (!e.preparacao.frete) motivos.push('frete não definido')
  if (!e.preparacao.volumes) motivos.push('volumes não conferidos')
  if (e.analise.itens.some((i) => i.semPreco)) motivos.push('item sem preço na tabela')
  if (e.analise.itens.some((i) => i.diferenteDaTabela)) motivos.push('preço diferente da tabela: diferença aberta')
  const d = e.preparacao.decisaoDuplicata
  if (e.duplicata.situacao === 'duplicata') motivos.push('duplicata: ' + e.duplicata.motivo)
  if (e.duplicata.situacao === 'possivel') {
    if (!d) motivos.push('possível duplicata: a revisar (' + e.duplicata.motivo + ')')
    else if (d.decisao === 'e_duplicata') motivos.push('duplicata decidida pelo faturamento: ' + d.motivo)
  }
  if (motivos.length > 0) return { estado: 'bloqueado', motivos }
  const lib = e.preparacao.liberacao
  if (lib && lib.hash === e.hashAtual) return { estado: 'liberado', motivos: [] }
  return { estado: 'apto', motivos: [] }
}

/** Conteúdo que a liberação cobre. Mudou algo depois → hash diferente → liberação desfeita na leitura. */
export function hashDoConteudo(e: { analise: AnalisePedido; preparacao: Preparacao; clienteOmie: string }): string {
  return JSON.stringify({
    p: e.analise.pedidoId,
    c: e.clienteOmie,
    o: e.analise.origem,
    u: e.analise.unidade?.unidade ?? null,
    i: e.analise.itens.map((i) => [i.item, i.quantidade, i.precoPedido, i.precoTabela]),
    f: e.preparacao.frete,
    v: e.preparacao.volumes ? [e.preparacao.volumes.quantidade, e.preparacao.volumes.pesoBruto] : null,
  })
}

export type ResultadoLiberacao =
  | { ok: true; preparacao: Preparacao }
  | Recusa403
  | RecusaVersao
  | { ok: false; http: 409; erro: 'nao_esta_apto'; motivos: string[] }

export function liberarParaFaturar(e: {
  perfil: PerfilFat | null
  usuario: string
  avaliacao: AvaliacaoFila
  preparacao: Preparacao
  versaoEsperada: number
  hashAtual: string
  agora: Date
}): ResultadoLiberacao {
  if (!exigirAcaoFat(e.perfil, 'liberar_faturamento').permitido) return NEG
  if (e.preparacao.versao !== e.versaoEsperada) return { ok: false, http: 409, erro: 'versao_desatualizada' }
  if (e.avaliacao.estado !== 'apto') return { ok: false, http: 409, erro: 'nao_esta_apto', motivos: e.avaliacao.motivos }
  return {
    ok: true,
    preparacao: {
      ...e.preparacao,
      versao: e.preparacao.versao + 1,
      liberacao: { hash: e.hashAtual, por: e.usuario, em: e.agora.toISOString() },
    },
  }
}

// ---- Gravação no Omie atrás da chave (CA-3-29) ----

export type OperacaoVenda = 'incluir_manual' | 'volumes_frete'

/** A chave liga para UM pedido e UMA operação por vez. */
export const escopoDaChave = (pedidoId: string, operacao: OperacaoVenda) => pedidoId + ':' + operacao

export interface PayloadIncluirPedidoVenda {
  operacao: 'incluir_pedido_venda'
  cabecalho: { codigo_pedido_integracao: string; codigo_cliente: number; data_previsao: string; quantidade_itens: number }
  det: { ide: { codigo_item_integracao: string }; produto: { codigo: string; quantidade: number; valor_unitario: number } }[]
  informacoes_adicionais: { numero_pedido_cliente: string }
}
export interface PayloadVolumesFrete {
  operacao: 'alterar_volumes_frete'
  cabecalho: { codigo_pedido_integracao: string }
  frete: { modalidade: ModalidadeFrete; quantidade_volumes: number; peso_bruto: number | null }
}

function dataOmie(iso: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? ''))
  return m ? m[3] + '/' + m[2] + '/' + m[1] : null
}

export function montarPayloadManual(p: PedidoManual, analise: AnalisePedido): { ok: true; payload: PayloadIncluirPedidoVenda } | { ok: false; motivo: string } {
  if (p.estado !== 'registrado') return { ok: false, motivo: 'pedido manual bloqueado ou a revisar' }
  if (!/^\d+$/.test(p.clienteOmie)) return { ok: false, motivo: 'cliente sem código do Omie' }
  const data = dataOmie(p.data)
  if (!data) return { ok: false, motivo: 'data inválida' }
  const det: PayloadIncluirPedidoVenda['det'] = []
  for (const it of p.itens) {
    const a = analise.itens.find((x) => x.item === norm(it.item))
    if (!a || a.precoTabela === null) return { ok: false, motivo: 'item ' + it.item + ' sem preço na tabela' }
    det.push({ ide: { codigo_item_integracao: p.codigoIntegracao + '-' + it.item }, produto: { codigo: it.item, quantidade: it.quantidade, valor_unitario: a.precoTabela } })
  }
  return {
    ok: true,
    payload: {
      operacao: 'incluir_pedido_venda',
      cabecalho: { codigo_pedido_integracao: p.codigoIntegracao, codigo_cliente: Number(p.clienteOmie), data_previsao: data, quantidade_itens: det.length },
      det,
      informacoes_adicionais: { numero_pedido_cliente: p.referencia ?? '' },
    },
  }
}

export function montarPayloadVolumes(codigoIntegracao: string, prep: Preparacao): { ok: true; payload: PayloadVolumesFrete } | { ok: false; motivo: string } {
  if (!prep.liberacao) return { ok: false, motivo: 'pedido não liberado' }
  if (!prep.frete || !prep.volumes) return { ok: false, motivo: 'frete ou volumes ausentes' }
  return {
    ok: true,
    payload: {
      operacao: 'alterar_volumes_frete',
      cabecalho: { codigo_pedido_integracao: codigoIntegracao },
      frete: { modalidade: prep.frete.modalidade, quantidade_volumes: prep.volumes.quantidade, peso_bruto: prep.volumes.pesoBruto },
    },
  }
}

export interface RespostaOmieVenda {
  respostaChegou: boolean
  efeitoAplicado: boolean
}
export interface AdapterVenda {
  incluir(p: PayloadIncluirPedidoVenda): RespostaOmieVenda
  alterarVolumesFrete(p: PayloadVolumesFrete): RespostaOmieVenda
}

export interface GravacaoVenda {
  pedidoId: string
  operacao: OperacaoVenda
  codigoIntegracao: string
  estado: 'confirmada' | 'resultado_incerto' | 'falhou_sem_efeito' | 'gravado_e_conferido'
}

export type ResultadoGravacaoVenda =
  | { http: 403; erro: 'sem_permissao' }
  | { http: 409; erro: 'ja_gravado' | 'nao_esta_liberado' }
  | { http: 422; erro: 'payload_invalido'; motivo: string }
  | { http: 423; erro: 'escrita_desligada'; mensagem: string; paraLancarAMao: object }
  | { http: 200; estado: 'confirmada' | 'resultado_incerto' | 'falhou_sem_efeito'; chamadas: 1; chaveDepois: { ligada: false } }

/**
 * Uma gravação por operação e pedido. Chave desligada: 423, zero chamadas, e a tela recebe o que lançar.
 * Já existe gravação (inclusive "resultado incerto"): 409, só se consulta. A chave desliga antes de gravar.
 */
export function gravarNoOmie(e: {
  perfil: PerfilFat | null
  operacao: OperacaoVenda
  chave: { ligada: boolean; escopo: string | null }
  pedidoId: string
  gravacoes: GravacaoVenda[]
  manual?: PedidoManual
  analise: AnalisePedido
  preparacao: Preparacao
  codigoIntegracao: string
  adapter: AdapterVenda
}): ResultadoGravacaoVenda {
  const acao = e.operacao === 'incluir_manual' ? 'preparar_pedido' : 'liberar_faturamento'
  if (!exigirAcaoFat(e.perfil, acao).permitido) return { http: 403, erro: 'sem_permissao' }
  let montado: { ok: true; payload: PayloadIncluirPedidoVenda | PayloadVolumesFrete } | { ok: false; motivo: string }
  if (e.operacao === 'incluir_manual') montado = e.manual ? montarPayloadManual(e.manual, e.analise) : { ok: false, motivo: 'pedido manual ausente' }
  else {
    if (!e.preparacao.liberacao) return { http: 409, erro: 'nao_esta_liberado' }
    montado = montarPayloadVolumes(e.codigoIntegracao, e.preparacao)
  }
  if (!e.chave.ligada || e.chave.escopo !== escopoDaChave(e.pedidoId, e.operacao)) {
    return {
      http: 423,
      erro: 'escrita_desligada',
      mensagem: MENSAGEM_VENDA_DESLIGADA,
      paraLancarAMao: montado.ok ? montado.payload : { motivo: montado.motivo },
    }
  }
  if (e.gravacoes.some((g) => g.pedidoId === e.pedidoId && g.operacao === e.operacao)) return { http: 409, erro: 'ja_gravado' }
  if (!montado.ok) return { http: 422, erro: 'payload_invalido', motivo: montado.motivo }
  const resp =
    e.operacao === 'incluir_manual'
      ? e.adapter.incluir(montado.payload as PayloadIncluirPedidoVenda)
      : e.adapter.alterarVolumesFrete(montado.payload as PayloadVolumesFrete)
  const chaveDepois = { ligada: false as const }
  if (!resp.respostaChegou) return { http: 200, estado: 'resultado_incerto', chamadas: 1, chaveDepois }
  return { http: 200, estado: resp.efeitoAplicado ? 'confirmada' : 'falhou_sem_efeito', chamadas: 1, chaveDepois }
}

export interface ConsultaVenda {
  encontrou: boolean
  quantidadeVolumes: number | null
  modalidade: string | null
  itens: number
}

/** Confere pela consulta (nunca grava de novo). Volumes e frete precisam bater com o liberado. */
export function conferirGravacao(
  operacao: OperacaoVenda,
  esperado: { itens?: number; prep?: Preparacao },
  consulta: ConsultaVenda,
): { estado: 'gravado_e_conferido' | 'resultado_incerto'; novaGravacao: false } {
  let ok = consulta.encontrou
  if (ok && operacao === 'incluir_manual') ok = consulta.itens === esperado.itens
  if (ok && operacao === 'volumes_frete') {
    ok = !!esperado.prep?.volumes && !!esperado.prep.frete && consulta.quantidadeVolumes === esperado.prep.volumes.quantidade && consulta.modalidade === esperado.prep.frete.modalidade
  }
  return { estado: ok ? 'gravado_e_conferido' : 'resultado_incerto', novaGravacao: false }
}

export type ModoSimuladorVenda = 'normal' | 'corta_resposta' | 'recusa'
export interface SimuladorVenda {
  adapter: AdapterVenda
  gravacoes: () => number
  consultar: (codigoIntegracao: string) => ConsultaVenda
}

export function criarSimuladorVenda(modo: ModoSimuladorVenda): SimuladorVenda {
  const pedidos: { [cod: string]: { itens: number; volumes: number | null; modalidade: string | null } } = {}
  let chamadas = 0
  return {
    adapter: {
      incluir(p) {
        chamadas++
        if (modo === 'recusa') return { respostaChegou: true, efeitoAplicado: false }
        const cod = p.cabecalho.codigo_pedido_integracao
        if (pedidos[cod]) return { respostaChegou: true, efeitoAplicado: false }
        pedidos[cod] = { itens: p.det.length, volumes: null, modalidade: null }
        return { respostaChegou: modo === 'normal', efeitoAplicado: true }
      },
      alterarVolumesFrete(p) {
        chamadas++
        if (modo === 'recusa') return { respostaChegou: true, efeitoAplicado: false }
        const cod = p.cabecalho.codigo_pedido_integracao
        const ped = pedidos[cod] ?? (pedidos[cod] = { itens: 0, volumes: null, modalidade: null })
        ped.volumes = p.frete.quantidade_volumes
        ped.modalidade = p.frete.modalidade
        return { respostaChegou: modo === 'normal', efeitoAplicado: true }
      },
    },
    gravacoes: () => chamadas,
    consultar(cod) {
      const p = pedidos[cod]
      return p ? { encontrou: true, quantidadeVolumes: p.volumes, modalidade: p.modalidade, itens: p.itens } : { encontrou: false, quantidadeVolumes: null, modalidade: null, itens: 0 }
    },
  }
}
