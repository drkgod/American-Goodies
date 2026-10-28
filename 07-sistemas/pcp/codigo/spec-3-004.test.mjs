// tests/pcp/spec-3-004.test.mjs — SPEC-3-004 CA-3-12 e CA-3-13 (P3.04-01 a 03, em fixture)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PERFIS_DE_TESTE } from '../../src/lib/pcp/acoes-compras.ts'
import { acrescentarVersao } from '../../src/lib/pcp/conversao.ts'
import { dataOmieParaIso } from '../../src/lib/pcp/omie-90d-mapa.ts'
import {
  chaveDaLinha,
  classificarPorCompras,
  lerPedidoCompra,
  mesclarLeitura,
  montarHistorico,
  precoDaLinha,
  resumoDoInsumo,
} from '../../src/lib/pcp/historico-precos.ts'

const { comprador, aprovador } = PERFIS_DE_TESTE
const linha = (o) => ({
  aplicativo: 'app1', pedido_id: 'P1', linha_id: 'L1', produto_id: 'FARINHA-DEMO', fornecedor: 'F1',
  unidade_compra: 'SC', quantidade: 4, preco_unitario: 250, valor_total: null, tipo_omie: null,
  cancelado: false, data: '2026-10-01', classificacao_compras: 'insumo', ...o,
})
const fatores = acrescentarVersao([], {
  item: 'FARINHA-DEMO', fornecedor: null, apresentacao: 'saco 25 kg', unidadeCompra: 'SC', fator: 25,
  unidadeEstoque: 'KG', confirmadoPor: 'c', confirmadoEm: '2026-10-01T00:00:00Z',
}).lista

test('P3.04-01/03: insumo, frete e serviço no mesmo pedido — só o insumo entra, a R$ 10,00/KG', () => {
  const h = montarHistorico(
    [
      linha({}),
      linha({ linha_id: 'L2', produto_id: 'FRETE', unidade_compra: 'UN', quantidade: 1, preco_unitario: 80, classificacao_compras: 'frete' }),
      linha({ linha_id: 'L3', produto_id: 'MONT', preco_unitario: 50, classificacao_compras: 'servico' }),
    ],
    fatores,
  )
  assert.equal(h.registros.length, 1)
  assert.deepEqual(
    { q: h.registros[0].quantidade, u: h.registros[0].unidade, p: h.registros[0].preco, e: h.registros[0].estado },
    { q: 100, u: 'KG', p: 10, e: 'comparavel' },
  )
  assert.deepEqual(h.foraDoInsumo.map((x) => x.classificacao), ['frete', 'servico'])
})

test('linha sem classificação fica "a classificar" e fora do histórico; Compras classifica como frete', () => {
  const l = linha({ produto_id: 'TAXA ENTREGA', classificacao_compras: null })
  assert.equal(montarHistorico([l], fatores).aClassificar.length, 1)
  assert.equal(montarHistorico([l], fatores).registros.length, 0)
  assert.equal(classificarPorCompras({ perfil: aprovador, linhas: [l], chave: chaveDaLinha(l), classificacao: 'frete' }).http, 403)
  assert.equal(classificarPorCompras({ perfil: comprador, linhas: [l], chave: chaveDaLinha(l), classificacao: 'qualquer' }).erro, 'classificacao_invalida')
  const r = classificarPorCompras({ perfil: comprador, linhas: [l], chave: chaveDaLinha(l), classificacao: 'frete' })
  assert.equal(r.ok, true)
  assert.equal(montarHistorico([r.linha], fatores).foraDoInsumo.length, 1)
})

test('P3.04-02: sem preço fica pendente, nunca zero; total ÷ quantidade só da mesma linha', () => {
  assert.equal(precoDaLinha(linha({ preco_unitario: null })), null)
  assert.equal(precoDaLinha(linha({ preco_unitario: 0 })), null)
  assert.equal(precoDaLinha(linha({ preco_unitario: null, valor_total: 1000 })), 250)
  assert.equal(precoDaLinha(linha({ preco_unitario: null, valor_total: 1000, quantidade: null })), null)
  const h = montarHistorico([linha({ preco_unitario: null })], fatores)
  assert.equal(h.registros[0].estado, 'preco_pendente')
  assert.equal(h.registros[0].preco, null)
  assert.equal(h.pendencias.semPreco, 1)
})

test('sem fator o preço fica na unidade de compra e fora da comparação; unidade igual à de estoque não precisa de fator', () => {
  const sem = montarHistorico([linha({})], [])
  assert.deepEqual({ p: sem.registros[0].preco, u: sem.registros[0].unidade, e: sem.registros[0].estado }, { p: 250, u: 'SC', e: 'sem_fator' })
  assert.equal(resumoDoInsumo(sem.registros, 'FARINHA-DEMO').geral, null)
  const igual = montarHistorico([linha({ unidade_compra: 'KG', preco_unitario: 9 })], [], { 'FARINHA-DEMO': 'KG' })
  assert.deepEqual({ p: igual.registros[0].preco, e: igual.registros[0].estado }, { p: 9, e: 'comparavel' })
})

test('cancelado aparece marcado e fica fora de menor, maior e média; período filtra', () => {
  const h = montarHistorico(
    [
      linha({ linha_id: 'A', preco_unitario: 250, data: '2026-09-01' }),
      linha({ linha_id: 'B', preco_unitario: 300, data: '2026-10-01', fornecedor: 'F2' }),
      linha({ linha_id: 'C', preco_unitario: 100, data: '2026-10-05', cancelado: true }),
    ],
    fatores,
  )
  assert.equal(h.registros.find((r) => r.linha_id === 'C').estado, 'cancelado')
  const r = resumoDoInsumo(h.registros, 'farinha-demo')
  assert.deepEqual({ menor: r.geral.menor, maior: r.geral.maior, media: r.geral.media }, { menor: 10, maior: 12, media: 11 })
  assert.equal(r.porFornecedor.length, 2)
  const so = resumoDoInsumo(h.registros, 'FARINHA-DEMO', { de: '2026-09-15' })
  assert.equal(so.geral.registros, 1)
  assert.equal(so.geral.maior, 12)
})

test('fatores ambíguos (apresentações com fatores diferentes) não são escolhidos sozinhos', () => {
  const dois = acrescentarVersao(fatores, {
    item: 'FARINHA-DEMO', fornecedor: null, apresentacao: 'saco 20 kg', unidadeCompra: 'SC', fator: 20,
    unidadeEstoque: 'KG', confirmadoPor: 'c', confirmadoEm: '2026-10-01T00:00:00Z',
  }).lista
  assert.equal(montarHistorico([linha({})], dois).registros[0].estado, 'sem_fator')
})

test('nova leitura mantém a classificação de Compras e não apaga linha que sumiu', () => {
  const guardadas = [linha({ classificacao_compras: 'frete' }), linha({ linha_id: 'L9' })]
  const novas = mesclarLeitura(guardadas, [linha({ preco_unitario: 260, classificacao_compras: null })])
  assert.equal(novas.length, 2)
  const l1 = novas.find((l) => l.linha_id === 'L1')
  assert.equal(l1.preco_unitario, 260)
  assert.equal(l1.classificacao_compras, 'frete')
})

test('CA-3-13: leitura de preço fica desligada até os campos serem conferidos numa amostra', () => {
  const ped = {
    cabecalho_consulta: { nCodPed: 1, nCodFor: 77, dIncData: '01/10/2026' },
    produtos_consulta: [{ nCodItem: 1, nCodProd: 5, cUnidade: 'SC', nQtde: 4, nValUnit: 250 }],
  }
  const desligada = lerPedidoCompra(ped, { camposConfirmados: false, aplicativo: 'app1' }, dataOmieParaIso)
  assert.deepEqual({ b: desligada.bloqueada, n: desligada.linhas.length }, { b: true, n: 0 })
  const ligada = lerPedidoCompra(ped, { camposConfirmados: true, aplicativo: 'app1' }, dataOmieParaIso)
  assert.equal(ligada.linhas[0].preco_unitario, 250)
  assert.equal(ligada.linhas[0].data, '2026-10-01')
  assert.equal(ligada.linhas[0].classificacao_compras, null)
  const semPreco = lerPedidoCompra({ ...ped, produtos_consulta: [{ nCodItem: 1, nCodProd: 5, nQtde: 4 }] }, { camposConfirmados: true, aplicativo: 'app1' }, dataOmieParaIso)
  assert.equal(semPreco.linhas[0].preco_unitario, null)
})
