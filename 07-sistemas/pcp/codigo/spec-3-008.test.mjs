// tests/pcp/spec-3-008.test.mjs — SPEC-3-008 CA-3-23, CA-3-24, CA-3-25 (P3.08-01 a 04, em fixture)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  ACOES_FATURAMENTO, MATRIZ_FATURAMENTO, PERFIS_FAT_DE_TESTE, acoesFatConcedidas, contaRealPodeReceberFat, exigirAcaoFat,
} from '../../src/lib/pcp/acoes-faturamento.ts'
import {
  analisarPedido, classificarOrigem, decidirNomeCanal, precoVigente, registrarNomeCanal, salvarPreco, salvarUnidade, situacaoNuvemshop, unidadeVigente,
} from '../../src/lib/pcp/unidades.ts'

const { faturamento, expedicao, liberador } = PERFIS_FAT_DE_TESTE
const AGORA = new Date('2026-10-28T20:00:00Z')

test('as cinco ações existem; P3.08-01: sem preparar_pedido → 403 sem pistas', () => {
  assert.equal(ACOES_FATURAMENTO.length, 5)
  assert.deepEqual(exigirAcaoFat(expedicao, 'preparar_pedido'), { permitido: false, http: 403, erro: 'sem_permissao' })
  assert.equal(exigirAcaoFat(faturamento, 'preparar_pedido').permitido, true)
  const sem = exigirAcaoFat(expedicao, 'preparar_pedido')
  for (const p of [null, { ...faturamento, ativo: false }, { ...faturamento, areas: ['compras'] }]) assert.deepEqual(exigirAcaoFat(p, 'preparar_pedido'), sem)
  assert.deepEqual(exigirAcaoFat(faturamento, 'acao_inexistente'), sem)
})

test('área sem a ação continua negada; cada perfil só exerce as próprias ações; conta real não recebe fora da matriz', () => {
  const soArea = { ativo: true, areas: ['faturamento'], acoes: [] }
  for (const a of ACOES_FATURAMENTO) assert.equal(exigirAcaoFat(soArea, a).permitido, false)
  assert.deepEqual(acoesFatConcedidas(expedicao), ['consultar_faturamento', 'conferir_volumes'])
  assert.deepEqual(acoesFatConcedidas(liberador), ['consultar_faturamento', 'liberar_faturamento'])
  assert.deepEqual(acoesFatConcedidas(null), [])
  for (const a of ACOES_FATURAMENTO) assert.equal(contaRealPodeReceberFat(a), false)
  assert.equal(MATRIZ_FATURAMENTO.aprovadaPeloDono, false)
  const aprovada = { aprovadaPeloDono: true, acoesAprovadas: ['consultar_faturamento'] }
  assert.equal(contaRealPodeReceberFat('consultar_faturamento', aprovada), true)
  assert.equal(contaRealPodeReceberFat('liberar_faturamento', aprovada), false)
})

function unidadeX() {
  return salvarUnidade({ perfil: faturamento, usuario: 'fat', lista: [], clienteOmie: '123', unidade: 'Mr. Cheney X', nomeFantasiaOperacional: 'Mr. Cheney X', tipo: 'franquia', versaoEsperada: 0, agora: AGORA })
}

test('unidade: versão nova a cada mudança com autor e hora; versão esperada errada é 409; sem ação é 403; dados inválidos', () => {
  const v1 = unidadeX()
  assert.deepEqual({ ok: v1.ok, v: v1.unidade.versao, por: v1.unidade.alteradoPor }, { ok: true, v: 1, por: 'fat' })
  const v2 = salvarUnidade({ perfil: faturamento, usuario: 'fat2', lista: v1.lista, clienteOmie: '123', unidade: 'Mr. Cheney X', nomeFantasiaOperacional: 'Mr. Cheney Xis', tipo: 'franquia', versaoEsperada: 1, agora: AGORA })
  assert.equal(v2.unidade.versao, 2)
  assert.equal(v1.lista[0].nomeFantasiaOperacional, 'Mr. Cheney X') // versão 1 intacta
  assert.equal(salvarUnidade({ perfil: faturamento, usuario: 'x', lista: v1.lista, clienteOmie: '123', unidade: 'U', nomeFantasiaOperacional: 'N', tipo: 'franquia', versaoEsperada: 0, agora: AGORA }).http, 409)
  assert.equal(salvarUnidade({ perfil: expedicao, usuario: 'x', lista: [], clienteOmie: '1', unidade: 'U', nomeFantasiaOperacional: 'N', tipo: 'franquia', versaoEsperada: 0, agora: AGORA }).http, 403)
  assert.equal(salvarUnidade({ perfil: faturamento, usuario: 'x', lista: [], clienteOmie: '', unidade: '', nomeFantasiaOperacional: '', tipo: 'outro', versaoEsperada: 0, agora: AGORA }).motivos.length, 4)
})

test('P3.08-02: nome do canal diferente fica "a revisar" e o operacional é mantido; igual (sem acento/caixa) fica "igual"', () => {
  const { lista } = unidadeX()
  const r = registrarNomeCanal({ perfil: faturamento, unidades: lista, nomes: [], canal: 'nuvemshop', clienteOmie: '123', nomeRecebido: 'Loja X Shopping' })
  assert.deepEqual({ e: r.nome.estado, intacta: r.unidadesIntactas }, { e: 'a_revisar', intacta: true })
  assert.equal(unidadeVigente(lista, '123').nomeFantasiaOperacional, 'Mr. Cheney X')
  assert.equal(registrarNomeCanal({ perfil: faturamento, unidades: lista, nomes: [], canal: 'lunet', clienteOmie: '123', nomeRecebido: ' MR.  cheney x ' }).nome.estado, 'igual')
  assert.equal(registrarNomeCanal({ perfil: faturamento, unidades: lista, nomes: r.nomes, canal: 'nuvemshop', clienteOmie: '123', nomeRecebido: 'loja x shopping' }).nomes.length, 1) // repetir não duplica
  assert.equal(registrarNomeCanal({ perfil: faturamento, unidades: lista, nomes: [], canal: 'nuvemshop', clienteOmie: '999', nomeRecebido: 'X' }).erro, 'unidade_nao_cadastrada')
})

test('faturamento aceita (versão nova do operacional com registro) ou recusa (nada muda)', () => {
  const { lista } = unidadeX()
  const r = registrarNomeCanal({ perfil: faturamento, unidades: lista, nomes: [], canal: 'nuvemshop', clienteOmie: '123', nomeRecebido: 'Loja X Shopping' })
  const rec = decidirNomeCanal({ perfil: faturamento, usuario: 'fat', unidades: lista, nomes: r.nomes, canal: 'nuvemshop', clienteOmie: '123', nomeRecebido: 'Loja X Shopping', decisao: 'recusado', agora: AGORA })
  assert.deepEqual({ n: rec.unidades.length, e: rec.nomes[0].estado }, { n: 1, e: 'recusado' })
  const ac = decidirNomeCanal({ perfil: faturamento, usuario: 'fat', unidades: lista, nomes: r.nomes, canal: 'nuvemshop', clienteOmie: '123', nomeRecebido: 'Loja X Shopping', decisao: 'aceito', agora: AGORA })
  const v = unidadeVigente(ac.unidades, '123')
  assert.deepEqual({ nome: v.nomeFantasiaOperacional, versao: v.versao, por: v.alteradoPor }, { nome: 'Loja X Shopping', versao: 2, por: 'fat' })
  assert.equal(decidirNomeCanal({ perfil: expedicao, usuario: 'x', unidades: lista, nomes: r.nomes, canal: 'nuvemshop', clienteOmie: '123', nomeRecebido: 'Loja X Shopping', decisao: 'aceito', agora: AGORA }).http, 403)
  assert.equal(decidirNomeCanal({ perfil: faturamento, usuario: 'x', unidades: ac.unidades, nomes: ac.nomes, canal: 'nuvemshop', clienteOmie: '123', nomeRecebido: 'Loja X Shopping', decisao: 'aceito', agora: AGORA }).erro, 'nada_a_revisar')
})

const tabela = (...ps) => ps.reduce((t, p) => salvarPreco({ perfil: faturamento, tabela: t, unidade: 'CX', vigenciaInicio: '2026-10-01', ...p }).tabela, [])
const pedido = (o = {}) => ({ pedidoId: 'P1', clienteOmie: '123', data: '2026-10-28', origem: 'omie', itens: [{ item: 'BROWNIE', quantidade: 10, precoPedido: 50 }], subtotalPedido: 500, ...o })

test('P3.08-04: 10 caixas a R$ 50,00 com tabela vigente R$ 50,00 → subtotal R$ 500,00 igual; origem mostrada', () => {
  const { lista } = unidadeX()
  const a = analisarPedido(pedido(), lista, tabela({ chave: '123', item: 'BROWNIE', preco: 50 }))
  assert.deepEqual({ r: a.subtotalRecalculado, p: a.subtotalPedido, d: a.diferenca, o: a.origem, apto: a.aptoParaPreparar }, { r: 500, p: 500, d: 0, o: 'omie', apto: true })
})

test('P3.08-03: item sem preço na tabela → subtotal pendente com o item', () => {
  const { lista } = unidadeX()
  const a = analisarPedido(pedido({ itens: [{ item: 'BROWNIE', quantidade: 10, precoPedido: 50 }, { item: 'COOKIE', quantidade: 2, precoPedido: 5 }] }), lista, tabela({ chave: '123', item: 'BROWNIE', preco: 50 }))
  assert.deepEqual({ r: a.subtotalRecalculado, pend: a.subtotalPendente, d: a.diferenca }, { r: null, pend: ['COOKIE'], d: null })
})

test('preço diferente da tabela aparece e não é trocado; diferença de subtotal visível', () => {
  const { lista } = unidadeX()
  const a = analisarPedido(pedido({ itens: [{ item: 'BROWNIE', quantidade: 10, precoPedido: 45 }], subtotalPedido: 450 }), lista, tabela({ chave: '123', item: 'BROWNIE', preco: 50 }))
  assert.deepEqual({ dif: a.itens[0].diferenteDaTabela, pp: a.itens[0].precoPedido, rec: a.subtotalRecalculado, d: a.diferenca }, { dif: true, pp: 45, rec: 500, d: -50 })
})

test('tabela: vigência e versão; preço da unidade vale mais que o geral; sem ação é 403', () => {
  const t = tabela({ chave: '*', item: 'BROWNIE', preco: 40 }, { chave: '123', item: 'BROWNIE', preco: 50 }, { chave: '123', item: 'BROWNIE', preco: 55, vigenciaInicio: '2026-11-01' }, { chave: '123', item: 'BROWNIE', preco: 51 })
  assert.equal(precoVigente(t, '123', 'brownie', '2026-10-28').preco, 51) // versão 2 da mesma vigência
  assert.equal(precoVigente(t, '123', 'BROWNIE', '2026-11-02').preco, 55)
  assert.equal(precoVigente(t, '999', 'BROWNIE', '2026-10-28').preco, 40) // cai no geral
  assert.equal(precoVigente(t, '123', 'BROWNIE', '2026-09-01'), null)
  assert.equal(salvarPreco({ perfil: expedicao, tabela: [], chave: '1', item: 'A', preco: 1, unidade: 'CX', vigenciaInicio: '2026-10-01' }).http, 403)
  assert.equal(salvarPreco({ perfil: faturamento, tabela: [], chave: '1', item: 'A', preco: 0, unidade: 'CX', vigenciaInicio: 'x' }).motivos.length, 2)
})

test('RN-05: cliente sem unidade não fica apto; RN-04 origem a confirmar; RN-03 Nuvemshop não paga é intenção', () => {
  const sem = analisarPedido(pedido({ clienteOmie: '999' }), [], [])
  assert.deepEqual({ nc: sem.unidadeNaoCadastrada, apto: sem.aptoParaPreparar }, { nc: true, apto: false })
  assert.ok(sem.motivos.includes('Unidade não cadastrada'))
  assert.equal(classificarOrigem({ canal: 'nuvemshop', referenciaComprovada: false }), 'a_confirmar')
  assert.equal(classificarOrigem({ canal: 'nuvemshop', referenciaComprovada: true }), 'nuvemshop')
  assert.equal(classificarOrigem({ canal: 'lunet', referenciaComprovada: true }), 'lunet_pelo_omie')
  assert.equal(classificarOrigem({ canal: null, referenciaComprovada: true }), 'a_confirmar')
  assert.deepEqual(['paid', 'pending', 'authorized', 'voided'].map(situacaoNuvemshop), ['confirmado', 'intencao', 'intencao', 'intencao'])
  const { lista } = unidadeX()
  const a = analisarPedido(pedido({ origem: 'nuvemshop', situacaoCanal: 'intencao' }), lista, tabela({ chave: '123', item: 'BROWNIE', preco: 50 }))
  assert.equal(a.aptoParaPreparar, false)
  assert.ok(a.motivos.some((m) => m.includes('intenção')))
})
