// tests/pcp/spec-3-007.test.mjs — SPEC-3-007 CA-3-19 a CA-3-22 (P3.07-01 a 05, em fixture)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PERFIS_DE_TESTE } from '../../src/lib/pcp/acoes-compras.ts'
import { autorizarExcecao } from '../../src/lib/pcp/bloqueio-item.ts'
import { acrescentarVersao } from '../../src/lib/pcp/conversao.ts'
import {
  AVISO_JA_PAGA, marcarPagoAntecipado, pedidosJaPagos, preConferir, registrarParcelas, registrarRecebimento,
} from '../../src/lib/pcp/recebimento.ts'

const { comprador, aprovador, almoxarifado, financeiro } = PERFIS_DE_TESTE
const AGORA = new Date('2026-10-28T19:00:00Z')
const pedidos = [
  { pedidoId: 'A', fornecedor: 'F1', linhas: [{ item: 'FARINHA-DEMO', quantidadeEstoque: 60 }] },
  { pedidoId: 'B', fornecedor: 'F1', linhas: [{ item: 'FARINHA-DEMO', quantidadeEstoque: 40 }] },
]
const base = {
  perfil: almoxarifado, usuario: 'almox', chave: 'REC-1', fornecedor: 'F1', data: '2026-10-28', pedidos, anteriores: [], fatores: [],
  unidadePorItem: { 'FARINHA-DEMO': 'KG' }, catalogo: ['FARINHA-DEMO'], excecoes: [], comprasPagas: [], agora: AGORA,
}
const linha = (ligacoes, o = {}) => ({ item: 'FARINHA-DEMO', quantidadeEstoque: 100, ligacoes, ...o })

test('P3.07-04: 100 KG = 60 do pedido A + 40 do pedido B → ligações gravadas, sem diferença', () => {
  const r = registrarRecebimento({ ...base, linhas: [linha([{ pedidoId: 'A', quantidade: 60 }, { pedidoId: 'B', quantidade: 40 }])] })
  assert.equal(r.ok, true)
  assert.deepEqual(r.recebimento.linhas[0].ligacoes.map((g) => g.quantidade), [60, 40])
  assert.deepEqual(r.recebimento.diferencas, [])
  // repetir a mesma chave não duplica
  const de_novo = registrarRecebimento({ ...base, anteriores: [r.recebimento], linhas: [linha([{ pedidoId: 'A', quantidade: 60 }])] })
  assert.deepEqual({ ok: de_novo.ok, criado: de_novo.criado }, { ok: true, criado: false })
})

test('P3.07-01: linha de 100 KG ligada a 60 + 30 é recusada (soma diferente)', () => {
  const r = registrarRecebimento({ ...base, linhas: [linha([{ pedidoId: 'A', quantidade: 60 }, { pedidoId: 'B', quantidade: 30 }])] })
  assert.deepEqual({ ok: r.ok, e: r.erro }, { ok: false, e: 'soma_diferente' })
  assert.match(r.motivos[0], /90/)
})

test('falta e sobra aparecem, somando recebimentos anteriores; nada ajusta estoque', () => {
  const r1 = registrarRecebimento({ ...base, linhas: [linha([{ pedidoId: 'A', quantidade: 50 }], { quantidadeEstoque: 50 })] })
  assert.deepEqual(r1.recebimento.diferencas, [{ pedidoId: 'A', item: 'FARINHA-DEMO', pedido: 60, recebido: 50, tipo: 'falta', diferenca: 10 }])
  const r2 = registrarRecebimento({ ...base, chave: 'REC-2', anteriores: [r1.recebimento], linhas: [linha([{ pedidoId: 'A', quantidade: 15 }], { quantidadeEstoque: 15 })] })
  assert.deepEqual(r2.recebimento.diferencas.map((d) => [d.tipo, d.diferenca]), [['sobra', 5]])
  assert.equal('estoque' in r2.recebimento, false)
})

test('quantidade de compra converte pelo fator; sem fator pede a quantidade em estoque', () => {
  const fatores = acrescentarVersao([], { item: 'FARINHA-DEMO', fornecedor: null, apresentacao: 'saco 25 kg', unidadeCompra: 'SC', fator: 25, unidadeEstoque: 'KG', confirmadoPor: 'c', confirmadoEm: '2026-10-01T00:00:00Z' }).lista
  const l = { item: 'FARINHA-DEMO', quantidadeCompra: 4, apresentacao: 'saco 25 kg', unidadeCompra: 'SC', ligacoes: [{ pedidoId: 'A', quantidade: 60 }, { pedidoId: 'B', quantidade: 40 }] }
  assert.equal(registrarRecebimento({ ...base, fatores, linhas: [l] }).recebimento.linhas[0].fatorUsado, 25)
  assert.equal(registrarRecebimento({ ...base, fatores: [], linhas: [l] }).erro, 'dados_invalidos')
})

test('RN-01: pedido que não é aprovado do fornecedor, ou linha sem pedido, é bloqueado; sem permissão é 403', () => {
  assert.equal(registrarRecebimento({ ...base, linhas: [linha([{ pedidoId: 'Z', quantidade: 100 }])] }).erro, 'sem_pedido_aprovado')
  assert.equal(registrarRecebimento({ ...base, fornecedor: 'F2', linhas: [linha([{ pedidoId: 'A', quantidade: 100 }])] }).erro, 'sem_pedido_aprovado')
  assert.equal(registrarRecebimento({ ...base, linhas: [linha([])] }).erro, 'sem_pedido_aprovado')
  assert.equal(registrarRecebimento({ ...base, perfil: comprador, linhas: [linha([{ pedidoId: 'A', quantidade: 100 }])] }).http, 403)
})

test('P3.07-03: item sem cadastro sem exceção é bloqueado; com exceção autorizada entra pendente de regularização', () => {
  const sem = registrarRecebimento({ ...base, catalogo: [], linhas: [linha([{ pedidoId: 'A', quantidade: 60 }, { pedidoId: 'B', quantidade: 40 }])] })
  assert.deepEqual({ ok: sem.ok, e: sem.erro }, { ok: false, e: 'item_sem_cadastro' })
  assert.match(sem.motivos[0], /cadastrar no Omie antes de comprar/)
  const exc = autorizarExcecao({ perfil: aprovador, usuario: 'aprov', item: 'FARINHA-DEMO', documento: 'recebimento', documentoId: 'REC-1', motivo: 'chegou antes do cadastro', existentes: [], agora: AGORA }).excecao
  const com = registrarRecebimento({ ...base, catalogo: [], excecoes: [exc], linhas: [linha([{ pedidoId: 'A', quantidade: 60 }, { pedidoId: 'B', quantidade: 40 }])] })
  assert.equal(com.ok, true)
  assert.equal(com.recebimento.linhas[0].porExcecao, true)
  assert.ok(com.recebimento.linhas[0].pendencias[0].includes('pendente de cadastro'))
})

test('item não pedido só entra por exceção autorizada', () => {
  const exc = autorizarExcecao({ perfil: aprovador, usuario: 'aprov', item: 'BRINDE', documento: 'recebimento', documentoId: 'REC-1', motivo: 'bonificação', existentes: [], agora: AGORA }).excecao
  const l = { item: 'BRINDE', quantidadeEstoque: 2, ligacoes: [] }
  assert.equal(registrarRecebimento({ ...base, catalogo: ['BRINDE'], linhas: [l] }).erro, 'sem_pedido_aprovado')
  const r = registrarRecebimento({ ...base, catalogo: ['BRINDE'], excecoes: [exc], linhas: [l] })
  assert.equal(r.ok, true)
  assert.equal(r.recebimento.linhas[0].porExcecao, true)
})

test('P3.07-02: compra já paga antes → aviso no recebimento e nenhuma parcela nova', () => {
  const p = registrarParcelas({ perfil: financeiro, pedidoId: 'A', parcelas: [{ numero: 1, vencimento: '2026-11-30', valor: 600 }], existentes: [] })
  const pago = marcarPagoAntecipado({ perfil: financeiro, pedidoId: 'A', referencia: 'comprovante 123', parcelas: p.parcelas })
  assert.deepEqual(pedidosJaPagos(pago.parcelas), ['A'])
  const r = registrarRecebimento({ ...base, comprasPagas: pedidosJaPagos(pago.parcelas), linhas: [linha([{ pedidoId: 'A', quantidade: 60 }, { pedidoId: 'B', quantidade: 40 }])] })
  assert.ok(r.recebimento.avisosJaPaga[0].includes(AVISO_JA_PAGA))
  assert.equal(r.recebimento.avisosJaPaga.length, 1) // só o pedido A é pago
  assert.equal('parcelas' in r.recebimento, false)
})

test('parcelas: só o financeiro; uma por pedido e número; valores inválidos recusados; pagamento exige referência', () => {
  assert.equal(registrarParcelas({ perfil: almoxarifado, pedidoId: 'A', parcelas: [{ numero: 1, vencimento: '2026-11-30', valor: 1 }], existentes: [] }).http, 403)
  assert.equal(registrarParcelas({ perfil: financeiro, pedidoId: 'A', parcelas: [{ numero: 1, vencimento: '2026-11-30', valor: 0 }, { numero: 1, vencimento: 'x', valor: 5 }], existentes: [] }).motivos.length, 3)
  const p1 = registrarParcelas({ perfil: financeiro, pedidoId: 'A', parcelas: [{ numero: 1, vencimento: '2026-11-30', valor: 300 }, { numero: 2, vencimento: '2026-12-30', valor: 300 }], existentes: [] })
  const p2 = registrarParcelas({ perfil: financeiro, pedidoId: 'A', parcelas: [{ numero: 1, vencimento: '2026-12-05', valor: 300 }], existentes: p1.parcelas })
  assert.equal(p2.parcelas.length, 1) // refaz as parcelas do pedido; não duplica
  assert.equal(marcarPagoAntecipado({ perfil: financeiro, pedidoId: 'A', referencia: ' ', parcelas: p1.parcelas }).erro, 'dados_invalidos')
  assert.deepEqual(pedidosJaPagos(p1.parcelas), [])
})

const rec100 = () => registrarRecebimento({ ...base, linhas: [linha([{ pedidoId: 'A', quantidade: 60 }, { pedidoId: 'B', quantidade: 40 }])] }).recebimento
const nota = (q, dup = 600) => ({ demonstracao: true, emitente: 'Fornecedor Demo', numero: '1', serie: '1', itens: [{ item: 'FARINHA-DEMO', quantidade: q, unidade: 'KG', valor: 600 }], duplicatas: [{ numero: 1, vencimento: '2026-11-30', valor: dup }] })
const parcelasA = registrarParcelas({ perfil: financeiro, pedidoId: 'A', parcelas: [{ numero: 1, vencimento: '2026-11-30', valor: 600 }], existentes: [] }).parcelas

test('P3.07-05: nota de demonstração com 110 KG para pedido de 100 KG fica pendente com 10 KG de diferença', () => {
  const pedido = { pedidoId: 'AB', fornecedor: 'F1', linhas: [{ item: 'FARINHA-DEMO', quantidadeEstoque: 100 }] }
  const rec = rec100()
  const recAB = { ...rec, linhas: rec.linhas.map((l) => ({ ...l, ligacoes: [{ pedidoId: 'AB', quantidade: 100 }] })) }
  const r = preConferir({ perfil: almoxarifado, nota: nota(110), pedido, recebimentos: [recAB], parcelas: [] })
  assert.equal(r.estado, 'pendente')
  assert.deepEqual(r.pendencias.map((p) => p.diferenca), [10, 10])
  assert.equal(preConferir({ perfil: almoxarifado, nota: nota(100), pedido, recebimentos: [recAB], parcelas: [] }).estado, 'conferida')
})

test('pré-conferência: nota real não entra; item fora do pedido, duplicatas divergentes e aviso de já paga', () => {
  const pedidoA = pedidos[0]
  const recA = { ...rec100() }
  assert.equal(preConferir({ perfil: almoxarifado, nota: { ...nota(60), demonstracao: false }, pedido: pedidoA, recebimentos: [recA], parcelas: [] }).erro, 'nota_real_nao_entra')
  assert.equal(preConferir({ perfil: financeiro, nota: nota(60), pedido: pedidoA, recebimentos: [recA], parcelas: [] }).http, 403)
  const outro = preConferir({ perfil: almoxarifado, nota: { ...nota(60), itens: [{ item: 'OUTRO', quantidade: 1, unidade: 'KG', valor: 1 }] }, pedido: pedidoA, recebimentos: [recA], parcelas: [] })
  assert.equal(outro.pendencias[0].tipo, 'item_nao_pedido')
  const dup = preConferir({ perfil: almoxarifado, nota: nota(60, 500), pedido: pedidoA, recebimentos: [recA], parcelas: parcelasA })
  assert.equal(dup.pendencias.find((p) => p.tipo === 'total_duplicatas').diferenca, 100)
  const pago = marcarPagoAntecipado({ perfil: financeiro, pedidoId: 'A', referencia: 'r', parcelas: parcelasA }).parcelas
  assert.deepEqual(preConferir({ perfil: almoxarifado, nota: nota(60), pedido: pedidoA, recebimentos: [recA], parcelas: pago }).avisos, [AVISO_JA_PAGA])
})
