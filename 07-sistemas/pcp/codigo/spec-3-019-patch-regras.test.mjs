// tests/pcp/spec-3-019-patch-regras.test.mjs — patch de 02/11/2026: saldo firme, requisição e ligação do pedido
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { saldoFirme } from '../../src/lib/pcp/pedidos-firmes.ts'
import { PERFIS_DE_TESTE } from '../../src/lib/pcp/acoes-compras.ts'
import { acrescentarVersao } from '../../src/lib/pcp/conversao.ts'
import { alterarQuantidade, criarRequisicoes, decidirCompra, enviarParaAprovacao, registrarCotacao } from '../../src/lib/pcp/requisicao.ts'
import { ligarPedido, montarPayloadPedido } from '../../src/lib/pcp/pedido-compra.ts'

const MAPA = { versao: 's', status_elegiveis: ['faturado'], campo_data: 'data_operacional', horizonte_de: '2026-07-24', horizonte_ate: '2026-10-21' }
const L = (o) => ({ pedido_id: 'P1', linha_id: 'L1', produto_id: 'X', unidade: 'UN', quantidade_pedida: 20, quantidade_atendida: 5, status: 'faturado', data_operacional: '2026-10-01', ...o })

test('saldo firme: status desconhecido bloqueia só aquela linha e o total das outras segue', () => {
  const r = saldoFirme([L({ linha_id: 'A' }), L({ linha_id: 'B', status: 'nao_sei' }), L({ linha_id: 'C', quantidade_pedida: 10, quantidade_atendida: 0 })], MAPA)
  assert.equal(r.total_firme, 25)
  assert.equal(r.total_parcial, true)
  assert.equal(r.linhas.find((l) => l.linha_id === 'B').estado, 'bloqueada')
  assert.equal(r.linhas.find((l) => l.linha_id === 'B').firme, null)
  assert.equal(r.bloqueios.length, 1)
})

test('saldo firme: sem bloqueio o total não é parcial; só bloqueadas = null (nunca 0)', () => {
  assert.equal(saldoFirme([L({})], MAPA).total_parcial, false)
  const so = saldoFirme([L({ status: 'nao_sei' })], MAPA)
  assert.equal(so.total_firme, null)
  assert.equal(so.total_parcial, true)
})

test('saldo firme: data ausente e saldo inconsistente também bloqueiam só a linha', () => {
  const r = saldoFirme([L({ linha_id: 'A' }), L({ linha_id: 'B', data_operacional: null }), L({ linha_id: 'C', quantidade_atendida: 99 })], MAPA)
  assert.equal(r.total_firme, 15)
  assert.equal(r.bloqueios.length, 2)
})

const { comprador, aprovador } = PERFIS_DE_TESTE
const AGORA = new Date('2026-11-03T12:00:00Z')
let n = 0
const novoId = () => 'RQ' + ++n
const fatores = acrescentarVersao([], { item: 'FARINHA-DEMO', fornecedor: null, apresentacao: 'saco 25 kg', unidadeCompra: 'SC', fator: 25, unidadeEstoque: 'KG', confirmadoPor: 'c', confirmadoEm: '2026-10-01T00:00:00Z' }).lista
function compra() {
  const r0 = criarRequisicoes({ perfil: comprador, usuario: 'c', existentes: [], fatores, catalogo: ['FARINHA-DEMO'], excecoes: [], agora: AGORA, novoId,
    necessidades: [{ origem: 'o' + n, item: 'FARINHA-DEMO', fornecedor: '777', quantidadeEstoque: 100, unidadeEstoque: 'KG', apresentacao: 'saco 25 kg', unidadeCompra: 'SC', dataNecessaria: '2026-11-20' }] }).requisicoes[0]
  const cot = registrarCotacao({ perfil: comprador, requisicao: r0, item: 'FARINHA-DEMO', preco: 250, prazoDias: 5, condicaoPagamento: '28', fatores, novoId }).cotacao
  const cotacoes = [{ ...cot, escolhida: true }]
  const r1 = enviarParaAprovacao(comprador, r0, cotacoes).requisicao
  const d = decidirCompra({ perfil: aprovador, aprovador: 'g', requisicao: r1, cotacoes, alcadas: [{ aprovador: 'g', limite: 5000, demonstracao: true }], decisao: 'aprovada', agora: AGORA })
  return { requisicao: d.requisicao, cotacoes, aprovacao: d.aprovacao }
}

test('requisição: quantidade zero, negativa ou inválida ao alterar é recusada (422)', () => {
  const c = compra()
  for (const q of [0, -5, NaN]) {
    const r = alterarQuantidade({ perfil: comprador, requisicao: c.requisicao, versaoEsperada: c.requisicao.versao, item: 'FARINHA-DEMO', quantidadeEstoque: q })
    assert.deepEqual({ ok: r.ok, h: r.http, e: r.erro }, { ok: false, h: 422, e: 'quantidade_invalida' })
  }
  assert.equal(alterarQuantidade({ perfil: comprador, requisicao: c.requisicao, versaoEsperada: c.requisicao.versao, item: 'FARINHA-DEMO', quantidadeEstoque: 50 }).ok, true)
})

test('ligação do pedido: quantidade diferente da compra é recusada; igual passa', () => {
  const c = compra() // 100 KG = 4 SC
  const lido = (q) => ({ numero: '55', fornecedor: '777', itens: [{ produto: 'FARINHA-DEMO', quantidade: q }] })
  const ruim = ligarPedido({ perfil: comprador, compra: c, numero: '55', pedido: lido(5), vinculos: [] })
  assert.equal(ruim.erro, 'pedido_diferente')
  assert.match(ruim.diferencas.join(' '), /quantidade do item FARINHA-DEMO: a compra tem 4 e o pedido tem 5/)
  assert.equal(ligarPedido({ perfil: comprador, compra: c, numero: '55', pedido: lido(4), vinculos: [] }).ok, true)
})

test('conteúdo que muda depois da autorização muda o payload (base da recusa no servidor)', () => {
  const c = compra()
  const antes = montarPayloadPedido(c)
  const alt = alterarQuantidade({ perfil: comprador, requisicao: c.requisicao, versaoEsperada: c.requisicao.versao, item: 'FARINHA-DEMO', quantidadeEstoque: 150 })
  const depois = montarPayloadPedido({ ...c, requisicao: alt.requisicao })
  assert.equal(antes.ok, true)
  assert.equal(depois.ok, false) // aprovação invalidada: nem payload sai
})
