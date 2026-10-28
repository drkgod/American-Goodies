// tests/pcp/spec-3-005.test.mjs — SPEC-3-005 CA-3-14, CA-3-15, CA-3-16 (P3.05-01 a 05, em fixture)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PERFIS_DE_TESTE } from '../../src/lib/pcp/acoes-compras.ts'
import { acrescentarVersao } from '../../src/lib/pcp/conversao.ts'
import {
  alterarQuantidade, compararComHistorico, criarRequisicoes, decidirCompra, enviarParaAprovacao,
  podeVirarPedido, reavaliarAprovacao, registrarCotacao, valorDaRequisicao,
} from '../../src/lib/pcp/requisicao.ts'

const AGORA = new Date('2026-10-28T17:00:00Z')
const { comprador, aprovador } = PERFIS_DE_TESTE
let n = 0
const novoId = () => 'ID' + ++n
const fatores = acrescentarVersao([], {
  item: 'FARINHA-DEMO', fornecedor: null, apresentacao: 'saco 25 kg', unidadeCompra: 'SC', fator: 25,
  unidadeEstoque: 'KG', confirmadoPor: 'c', confirmadoEm: '2026-10-01T00:00:00Z',
}).lista
const nec = (o) => ({
  origem: 'sug1|v1', item: 'FARINHA-DEMO', fornecedor: 'F1', quantidadeEstoque: 100, unidadeEstoque: 'KG',
  apresentacao: 'saco 25 kg', unidadeCompra: 'SC', dataNecessaria: '2026-11-10', ...o,
})
const base = { perfil: comprador, usuario: 'comprador', existentes: [], fatores, catalogo: ['FARINHA-DEMO', 'ACUCAR-DEMO', 'SAL-DEMO'], excecoes: [], agora: AGORA, novoId }

test('P3.05-01: itens de dois fornecedores viram duas requisições; sem fornecedor fica "a definir"', () => {
  const r = criarRequisicoes({ ...base, necessidades: [nec({}), nec({ origem: 's2|v1', item: 'ACUCAR-DEMO', fornecedor: 'F2', apresentacao: null, unidadeCompra: null }), nec({ origem: 's3|v1', item: 'SAL-DEMO', fornecedor: null, apresentacao: null })] })
  assert.equal(r.ok, true)
  assert.deepEqual(r.requisicoes.map((x) => x.fornecedor).sort(), ['F1', 'F2', 'a definir'])
  const f1 = r.requisicoes.find((x) => x.fornecedor === 'F1').itens[0]
  assert.deepEqual({ qe: f1.quantidadeEstoque, qc: f1.quantidadeCompra, f: f1.fatorUsado }, { qe: 100, qc: 4, f: 25 })
  assert.ok(r.requisicoes.find((x) => x.fornecedor === 'F2').itens[0].pendencias.length > 0) // sem fator
})

test('repetir a criação não duplica; sem ação é 403; emergência exige motivo; item sem cadastro é barrado', () => {
  const um = criarRequisicoes({ ...base, necessidades: [nec({})] })
  const dois = criarRequisicoes({ ...base, existentes: um.requisicoes, necessidades: [nec({})] })
  assert.equal(dois.requisicoes.length, 0)
  assert.equal(dois.jaExistiam, 1)
  assert.equal(criarRequisicoes({ ...base, perfil: aprovador, necessidades: [nec({})] }).http, 403)
  assert.equal(criarRequisicoes({ ...base, necessidades: [nec({ emergencial: true })] }).ok, false)
  const em = criarRequisicoes({ ...base, necessidades: [nec({ emergencial: true, motivoEmergencia: 'linha parada' })] })
  assert.deepEqual({ e: em.requisicoes[0].emergencial, m: em.requisicoes[0].motivoEmergencia }, { e: true, m: 'linha parada' })
  const fora = criarRequisicoes({ ...base, necessidades: [nec({ item: 'ITEM-NOVO' })] })
  assert.equal(fora.requisicoes.length, 0)
  assert.equal(fora.bloqueados[0].mensagem, 'cadastrar no Omie antes de comprar')
})

test('P3.05-05: cotação 15% acima do último preço com tolerância 10% é destacada; sem tolerância só mostra a diferença', () => {
  const c = compararComHistorico(11.5, 10, 10)
  assert.deepEqual({ d: c.diferencaPercentual, a: c.acimaDaTolerancia }, { d: 15, a: true })
  assert.equal(compararComHistorico(11.5, 10, null).acimaDaTolerancia, false)
  assert.equal(compararComHistorico(11.5, 10, null).diferencaPercentual, 15)
  assert.equal(compararComHistorico(null, 10, 10).comparavel, false)
  assert.equal(compararComHistorico(11, null, 10).comparavel, false)
})

function fluxo() {
  const r0 = criarRequisicoes({ ...base, necessidades: [nec({})] }).requisicoes[0]
  const cot = registrarCotacao({ perfil: comprador, requisicao: r0, item: 'FARINHA-DEMO', preco: 250, prazoDias: 5, condicaoPagamento: '28 dias', fatores, novoId })
  assert.equal(cot.ok, true)
  assert.equal(cot.cotacao.precoPorUnidadeEstoque, 10)
  const cotacoes = [{ ...cot.cotacao, escolhida: true }]
  const env = enviarParaAprovacao(comprador, r0, cotacoes)
  assert.equal(env.ok, true)
  return { r: env.requisicao, cotacoes }
}
const alcadas = [{ aprovador: 'gerente', limite: 5000, demonstracao: true }, { aprovador: 'dono', limite: 50000, demonstracao: true }]

test('P3.05-04: sugestão de 100 KG até a aprovação, com valor, alçada e hash', () => {
  const { r, cotacoes } = fluxo()
  assert.equal(valorDaRequisicao(r, cotacoes), 1000)
  const d = decidirCompra({ perfil: aprovador, aprovador: 'gerente', requisicao: r, cotacoes, alcadas, decisao: 'aprovada', agora: AGORA })
  assert.equal(d.ok, true)
  assert.deepEqual({ e: d.requisicao.estado, v: d.aprovacao.valor, a: d.aprovacao.alcadaUsada, ok: d.aprovacao.valida }, { e: 'aprovada', v: 1000, a: 5000, ok: true })
  assert.ok(d.aprovacao.hash.length > 10)
  assert.equal(podeVirarPedido(d.requisicao, cotacoes, d.aprovacao), true)
})

test('P3.05-02: acima da alçada do primeiro aprovador é negado e indica a alçada maior', () => {
  const { r, cotacoes } = fluxo()
  const pequena = [{ aprovador: 'gerente', limite: 500, demonstracao: true }, { aprovador: 'dono', limite: 50000, demonstracao: true }]
  const neg = decidirCompra({ perfil: aprovador, aprovador: 'gerente', requisicao: r, cotacoes, alcadas: pequena, decisao: 'aprovada', agora: AGORA })
  assert.deepEqual({ ok: neg.ok, http: neg.http, erro: neg.erro, prox: neg.proximaAlcada }, { ok: false, http: 403, erro: 'acima_da_alcada', prox: 'dono' })
  const ok = decidirCompra({ perfil: aprovador, aprovador: 'dono', requisicao: r, cotacoes, alcadas: pequena, decisao: 'aprovada', agora: AGORA })
  assert.equal(ok.ok, true)
})

test('sem alçada cadastrada a aprovação real fica parada; sem a ação é 403; recusa exige motivo', () => {
  const { r, cotacoes } = fluxo()
  const parada = decidirCompra({ perfil: aprovador, aprovador: 'x', requisicao: r, cotacoes, alcadas: [], decisao: 'aprovada', agora: AGORA })
  assert.deepEqual({ http: parada.http, erro: parada.erro }, { http: 423, erro: 'alcada_nao_cadastrada' })
  assert.equal(decidirCompra({ perfil: comprador, aprovador: 'gerente', requisicao: r, cotacoes, alcadas, decisao: 'aprovada', agora: AGORA }).http, 403)
  assert.equal(decidirCompra({ perfil: aprovador, aprovador: 'gerente', requisicao: r, cotacoes, alcadas, decisao: 'recusada', agora: AGORA }).erro, 'sem_motivo')
  const rec = decidirCompra({ perfil: aprovador, aprovador: 'gerente', requisicao: r, cotacoes, alcadas, decisao: 'recusada', motivo: 'preço alto', agora: AGORA })
  assert.equal(rec.requisicao.estado, 'recusada')
  assert.equal(podeVirarPedido(rec.requisicao, cotacoes, rec.aprovacao), false)
})

test('P3.05-03: quantidade alterada depois da aprovação invalida a aprovação; não vira pedido', () => {
  const { r, cotacoes } = fluxo()
  const d = decidirCompra({ perfil: aprovador, aprovador: 'gerente', requisicao: r, cotacoes, alcadas, decisao: 'aprovada', agora: AGORA })
  const alt = alterarQuantidade({ perfil: comprador, requisicao: d.requisicao, versaoEsperada: d.requisicao.versao, item: 'FARINHA-DEMO', quantidadeEstoque: 150 })
  assert.equal(alt.ok, true)
  const re = reavaliarAprovacao(alt.requisicao, cotacoes, d.aprovacao)
  assert.equal(re.invalidada, true)
  assert.equal(re.requisicao.estado, 'em_aprovacao')
  assert.equal(re.aprovacao.valida, false)
  assert.equal(podeVirarPedido(alt.requisicao, cotacoes, d.aprovacao), false)
  assert.equal(reavaliarAprovacao(d.requisicao, cotacoes, d.aprovacao).invalidada, false) // sem mudança, segue aprovada
})

test('versão esperada errada é 409; cotação em requisição aprovada é recusada; sem cotação escolhida não vai para aprovação', () => {
  const { r, cotacoes } = fluxo()
  assert.equal(alterarQuantidade({ perfil: comprador, requisicao: r, versaoEsperada: 99, item: 'FARINHA-DEMO', quantidadeEstoque: 1 }).erro, 'conflito_de_versao')
  assert.equal(registrarCotacao({ perfil: comprador, requisicao: r, item: 'FARINHA-DEMO', preco: 1, prazoDias: 1, condicaoPagamento: '', fatores, novoId }).http, 409)
  const r0 = criarRequisicoes({ ...base, necessidades: [nec({ origem: 'z|v1' })] }).requisicoes[0]
  assert.equal(enviarParaAprovacao(comprador, r0, []).erro, 'sem_cotacao_escolhida')
  assert.equal(registrarCotacao({ perfil: comprador, requisicao: r0, item: 'OUTRO', preco: 1, prazoDias: 1, condicaoPagamento: '', fatores, novoId }).http, 422)
})
