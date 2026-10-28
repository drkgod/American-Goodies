// tests/pcp/spec-3-006.test.mjs — SPEC-3-006 CA-3-17 e CA-3-18 (P3.06-01 a 05, em fixture)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PERFIS_DE_TESTE } from '../../src/lib/pcp/acoes-compras.ts'
import { acrescentarVersao } from '../../src/lib/pcp/conversao.ts'
import { criarRequisicoes, decidirCompra, enviarParaAprovacao, registrarCotacao } from '../../src/lib/pcp/requisicao.ts'
import {
  calcularEntregas, conferirELigar, criarSimuladorPedido, lancarPedido, ligarPedido, montarPayloadPedido, resumoPorFornecedor,
} from '../../src/lib/pcp/pedido-compra.ts'

const { comprador, aprovador } = PERFIS_DE_TESTE
const AGORA = new Date('2026-10-28T18:00:00Z')
let n = 0
const novoId = () => 'REQ' + ++n
const fatores = acrescentarVersao([], {
  item: 'FARINHA-DEMO', fornecedor: null, apresentacao: 'saco 25 kg', unidadeCompra: 'SC', fator: 25,
  unidadeEstoque: 'KG', confirmadoPor: 'c', confirmadoEm: '2026-10-01T00:00:00Z',
}).lista

function compraAprovada({ fornecedor = '777', aprovar = true } = {}) {
  const r0 = criarRequisicoes({
    perfil: comprador, usuario: 'comprador', existentes: [], fatores, catalogo: ['FARINHA-DEMO'], excecoes: [], agora: AGORA, novoId,
    necessidades: [{ origem: 'o' + n, item: 'FARINHA-DEMO', fornecedor, quantidadeEstoque: 100, unidadeEstoque: 'KG', apresentacao: 'saco 25 kg', unidadeCompra: 'SC', dataNecessaria: '2026-11-10' }],
  }).requisicoes[0]
  const cot = registrarCotacao({ perfil: comprador, requisicao: r0, item: 'FARINHA-DEMO', preco: 250, prazoDias: 5, condicaoPagamento: '28', fatores, novoId }).cotacao
  const cotacoes = [{ ...cot, escolhida: true }]
  const r1 = enviarParaAprovacao(comprador, r0, cotacoes).requisicao
  if (!aprovar) return { requisicao: r1, cotacoes, aprovacao: null }
  const d = decidirCompra({ perfil: aprovador, aprovador: 'g', requisicao: r1, cotacoes, alcadas: [{ aprovador: 'g', limite: 5000, demonstracao: true }], decisao: 'aprovada', agora: AGORA })
  return { requisicao: d.requisicao, cotacoes, aprovacao: d.aprovacao }
}
const ligada = (c) => ({ ligada: true, escopo: c.requisicao.id })

test('P3.06-04: 20 KG pedidos, 5 recebidos, previsto ontem → restante 15 e 1 dia de atraso', () => {
  const l = { pedido_id: 'P1', numero: '1', linha_id: 'L1', fornecedor: 'F1', produto_id: 'A', unidade: 'KG', quantidade_pedida: 20, quantidade_recebida: 5, data_prevista: '2026-10-27', etapa: null, cancelado: false }
  const [e] = calcularEntregas([l], '2026-10-28', ['P1'])
  assert.deepEqual({ r: e.restante, d: e.diasAtraso, a: e.atrasado, em: e.emergencial }, { r: 15, d: 1, a: true, em: true })
})

test('entregas: recebido total não atrasa; cancelado comprovado não atrasa; sem previsão não atrasa; resumo por fornecedor', () => {
  const base = { pedido_id: 'P', numero: '1', linha_id: 'L', fornecedor: 'F1', produto_id: 'A', unidade: 'KG', quantidade_pedida: 10, quantidade_recebida: 0, data_prevista: '2026-10-01', etapa: null, cancelado: false }
  const es = calcularEntregas([
    { ...base, linha_id: '1', quantidade_recebida: 10 },
    { ...base, linha_id: '2', cancelado: true },
    { ...base, linha_id: '3', data_prevista: null },
    { ...base, linha_id: '4' },
    { ...base, linha_id: '5', quantidade_recebida: 12 },
  ], '2026-10-28')
  assert.deepEqual(es.map((e) => e.atrasado), [false, false, false, true, false])
  assert.equal(es[4].restante, 0) // recebeu a mais: nunca negativo
  assert.deepEqual(resumoPorFornecedor(es), [{ fornecedor: 'F1', emAberto: 2, atrasadas: 1 }])
})

test('P3.06-01: compra não aprovada não é lançada nem ligada', () => {
  const c = compraAprovada({ aprovar: false })
  const sim = criarSimuladorPedido('normal')
  const r = lancarPedido({ perfil: comprador, compra: c, chave: ligada(c), vinculos: [], adapter: sim.adapter })
  assert.deepEqual({ h: r.http, e: r.erro }, { h: 409, e: 'compra_nao_aprovada' })
  assert.equal(sim.gravacoes(), 0)
  assert.equal(ligarPedido({ perfil: comprador, compra: c, numero: '9', pedido: { numero: '9', fornecedor: '777', itens: [{ produto: 'FARINHA-DEMO', quantidade: 4 }] }, vinculos: [] }).erro, 'compra_nao_aprovada')
})

test('P3.06-02: chave desligada → 423 e zero chamadas; sem a ação é 403', () => {
  const c = compraAprovada()
  const sim = criarSimuladorPedido('normal')
  const r = lancarPedido({ perfil: comprador, compra: c, chave: { ligada: false, escopo: null }, vinculos: [], adapter: sim.adapter })
  assert.deepEqual({ h: r.http, e: r.erro }, { h: 423, e: 'escrita_desligada' })
  assert.equal(lancarPedido({ perfil: comprador, compra: c, chave: ligada({ requisicao: { id: 'OUTRA' } }), vinculos: [], adapter: sim.adapter }).http, 423) // escopo de outra compra
  assert.equal(lancarPedido({ perfil: aprovador, compra: c, chave: ligada(c), vinculos: [], adapter: sim.adapter }).http, 403)
  assert.equal(sim.gravacoes(), 0)
})

test('P3.06-03: número de outro fornecedor ou com outros itens é recusado com a diferença', () => {
  const c = compraAprovada()
  const outro = ligarPedido({ perfil: comprador, compra: c, numero: '9', pedido: { numero: '9', fornecedor: '888', itens: [{ produto: 'FARINHA-DEMO', quantidade: 4 }] }, vinculos: [] })
  assert.equal(outro.erro, 'pedido_diferente')
  assert.match(outro.diferencas[0], /fornecedor/)
  const itens = ligarPedido({ perfil: comprador, compra: c, numero: '9', pedido: { numero: '9', fornecedor: '777', itens: [{ produto: 'ACUCAR', quantidade: 1 }] }, vinculos: [] })
  assert.equal(itens.diferencas.length, 2)
  assert.equal(ligarPedido({ perfil: comprador, compra: c, numero: '9', pedido: null, vinculos: [] }).erro, 'pedido_nao_lido')
  const ok = ligarPedido({ perfil: comprador, compra: c, numero: '9', pedido: { numero: '9', fornecedor: '777', itens: [{ produto: 'FARINHA-DEMO', quantidade: 4 }] }, vinculos: [] })
  assert.deepEqual({ o: ok.ok, n: ok.vinculo.numeroOmie, c: ok.vinculo.codigoIntegracao === c.requisicao.id }, { o: true, n: '9', c: true })
  assert.equal(ligarPedido({ perfil: comprador, compra: c, numero: '9', pedido: { numero: '9', fornecedor: '777', itens: [{ produto: 'FARINHA-DEMO', quantidade: 4 }] }, vinculos: [ok.vinculo] }).erro, 'ja_ligada')
  const outraCompra = compraAprovada()
  assert.equal(ligarPedido({ perfil: comprador, compra: outraCompra, numero: '9', pedido: { numero: '9', fornecedor: '777', itens: [{ produto: 'FARINHA-DEMO', quantidade: 4 }] }, vinculos: [ok.vinculo] }).erro, 'pedido_ja_ligado')
})

test('payload usa os campos do WSDL e o código de integração = id da compra; fornecedor sem código do Omie é recusado', () => {
  const c = compraAprovada()
  const m = montarPayloadPedido(c)
  assert.equal(m.ok, true)
  assert.deepEqual(m.payload.cabecalho_incluir, { cCodIntPed: c.requisicao.id, dDtPrevisao: '10/11/2026', nCodFor: 777, cObs: '' })
  assert.deepEqual(m.payload.produtos_incluir[0], { cCodIntItem: c.requisicao.id + '-FARINHA-DEMO', cProduto: 'FARINHA-DEMO', cUnidade: 'SC', nQtde: 4, nValUnit: 250 })
  const sem = montarPayloadPedido(compraAprovada({ fornecedor: 'Fornecedor Demo' }))
  assert.equal(sem.ok, false)
  assert.match(sem.motivo, /código do Omie/)
})

test('P3.06-05: no simulador, resposta perdida → uma gravação; a consulta acha o pedido e liga sem gravar de novo', () => {
  const c = compraAprovada()
  const sim = criarSimuladorPedido('corta_resposta')
  const r = lancarPedido({ perfil: comprador, compra: c, chave: ligada(c), vinculos: [], adapter: sim.adapter })
  assert.deepEqual({ h: r.http, s: r.estado, ch: r.chamadas, lig: r.chaveDepois.ligada }, { h: 200, s: 'resultado_incerto', ch: 1, lig: false })
  const v = conferirELigar(c, sim.consultar(c.requisicao.id))
  assert.deepEqual({ e: v.estado, n: v.novaGravacao, num: v.vinculo.numeroOmie !== null }, { e: 'ligado', n: false, num: true })
  assert.equal(sim.gravacoes(), 1)
})

test('simulador: normal confirma e liga; recusa não deixa efeito; consulta vazia continua incerta', () => {
  const c = compraAprovada()
  const ok = criarSimuladorPedido('normal')
  assert.equal(lancarPedido({ perfil: comprador, compra: c, chave: ligada(c), vinculos: [], adapter: ok.adapter }).estado, 'confirmada')
  assert.equal(conferirELigar(c, ok.consultar(c.requisicao.id)).estado, 'ligado')
  const rec = criarSimuladorPedido('recusa')
  assert.equal(lancarPedido({ perfil: comprador, compra: c, chave: ligada(c), vinculos: [], adapter: rec.adapter }).estado, 'falhou_sem_efeito')
  assert.equal(conferirELigar(c, rec.consultar(c.requisicao.id)).estado, 'resultado_incerto')
  // já ligada: não grava
  const v = conferirELigar(c, ok.consultar(c.requisicao.id)).vinculo
  const outro = criarSimuladorPedido('normal')
  assert.equal(lancarPedido({ perfil: comprador, compra: c, chave: ligada(c), vinculos: [v], adapter: outro.adapter }).erro, 'ja_ligada')
  assert.equal(outro.gravacoes(), 0)
})
