// tests/pcp/spec-3-014.test.mjs — SPEC-3-014 CA-3-39, CA-3-40 (P3.14-01 a 04, em fixture)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  blocoVisivel, paraCsv, relatorioCompras, relatorioConsumo, relatorioPedidos, relatorioProducao, taxaPerdaDeclarada,
} from '../../src/lib/pcp/relatorios.ts'

test('P3.14-01: perda declarada sem produção realizada no período → taxa não calculável', () => {
  for (const produzido of [null, 0]) {
    const t = taxaPerdaDeclarada({ perdaDeclarada: 4, unidadePerda: 'UN', produzido, unidadeProduzida: 'UN' })
    assert.equal(t.calculavel, false)
    assert.equal(t.pct, null)
    assert.ok(t.motivo.includes('sem produção realizada'))
  }
  const u = taxaPerdaDeclarada({ perdaDeclarada: 4, unidadePerda: 'KG', produzido: 100, unidadeProduzida: 'UN' })
  assert.equal(u.calculavel, false)
  assert.ok(u.motivo.includes('unidade'))
})

test('P3.14-03: 100 UN produzidas e 4 UN de perda declarada → 4% com o denominador escrito', () => {
  const t = taxaPerdaDeclarada({ perdaDeclarada: 4, unidadePerda: 'un', produzido: 100, unidadeProduzida: 'UN' })
  assert.deepEqual([t.calculavel, t.pct, t.denominador], [true, 4, '100 UN produzidas'])
})

test('P3.14-02: perfil sem a área de compras não vê o bloco de compras (nem sabe que existe)', () => {
  assert.equal(blocoVisivel(['faturamento'], 'compras'), false)
  assert.equal(blocoVisivel(['compras'], 'compras'), true)
  assert.equal(blocoVisivel(['compras'], 'pedidos'), false)
  assert.equal(blocoVisivel(['faturamento'], 'pedidos'), true)
  assert.equal(blocoVisivel(['planejamento'], 'producao'), true)
  assert.equal(blocoVisivel(['apontar_producao'], 'consumo'), true)
  assert.equal(blocoVisivel(null, 'compras'), false)
  assert.equal(blocoVisivel(['compras'], 'bloco_inexistente'), false)
})

test('produção: planejado × produzido × conferido por produto e unidade; unidades não se somam; ausente não vira zero', () => {
  const r = relatorioProducao([
    { op: '1', produto: 'bolo', unidade: 'UN', planejado: 100, produzido: 90, conferido: 88 },
    { op: '2', produto: 'BOLO', unidade: 'UN', planejado: 50, produzido: 50, conferido: null },
    { op: '3', produto: 'BOLO', unidade: 'KG', planejado: 10, produzido: 10, conferido: 10 },
  ])
  const un = r.find((x) => x.unidade === 'UN')
  assert.deepEqual([un.planejado, un.produzido, un.conferido, un.ordens], [150, 140, null, 2])
  assert.equal(r.length, 2)
  assert.equal(r.find((x) => x.unidade === 'KG').planejado, 10)
})

test('consumo: 5,4 KG para ficha de 5 KG sem perda declarada → diferença sem causa de 0,4 KG (não é perda)', () => {
  const [l] = relatorioConsumo([{ item: 'ins-1', unidade: 'KG', previsto: 5, registrado: 5.4, perdaDeclarada: 0, residuo: 0, revisaoReceita: 0 }])
  assert.equal(l.diferenca, 0.4)
  assert.equal(l.diferencaSemCausa, 0.4)
  assert.equal(l.perdaDeclarada, 0)
  assert.ok(l.nota.includes('não é perda'))
})

test('consumo: as quatro categorias ficam separadas; o declarado abate só a diferença sem causa', () => {
  const [l] = relatorioConsumo([{ item: 'I', unidade: 'KG', previsto: 5, registrado: 6, perdaDeclarada: 0.4, residuo: 0.2, revisaoReceita: 0.1 }])
  assert.deepEqual([l.diferenca, l.diferencaSemCausa, l.perdaDeclarada, l.residuo, l.revisaoReceita], [1, 0.3, 0.4, 0.2, 0.1])
  const [baixo] = relatorioConsumo([{ item: 'I', unidade: 'KG', previsto: 5, registrado: 4.5, perdaDeclarada: 0, residuo: 0, revisaoReceita: 0 }])
  assert.equal(baixo.diferencaSemCausa, 0)
  assert.equal(baixo.nota, 'abaixo da ficha')
  const [sem] = relatorioConsumo([{ item: 'I', unidade: 'KG', previsto: null, registrado: 4.5, perdaDeclarada: 1, residuo: 0, revisaoReceita: 0 }])
  assert.deepEqual([sem.calculavel, sem.diferenca, sem.diferencaSemCausa], [false, null, null])
})

test('P3.14-04: compras — comprado × recebido por unidade, entregas no prazo e preço médio ponderado por fornecedor', () => {
  const linhas = [
    { fornecedor: 'F1', item: 'A', unidade: 'KG', comprado: 100, recebido: 100, dataNecessaria: '2026-11-10', dataRecebimento: '2026-11-09', preco: 10 },
    { fornecedor: 'F1', item: 'A', unidade: 'KG', comprado: 300, recebido: 200, dataNecessaria: '2026-11-10', dataRecebimento: '2026-11-12', preco: 12 },
    { fornecedor: 'F2', item: 'B', unidade: 'UN', comprado: 50, recebido: 0, dataNecessaria: '2026-11-20', dataRecebimento: null, preco: null },
  ]
  const r = relatorioCompras(linhas)
  assert.deepEqual(r.porUnidade, [{ unidade: 'KG', comprado: 400, recebido: 300 }, { unidade: 'UN', comprado: 50, recebido: 0 }])
  assert.deepEqual(r.entregas, { comRecebimento: 2, noPrazo: 1, atrasadas: 1, pctNoPrazo: 50 })
  assert.deepEqual(r.precoMedio, [{ fornecedor: 'F1', unidade: 'KG', precoMedio: 11.5, quantidadeBase: 400 }]) // (100×10 + 300×12) / 400
  assert.equal(r.lacunas.length, 1)
  assert.ok(r.lacunas[0].includes('sem preço'))
  assert.equal(relatorioCompras([]).entregas.pctNoPrazo, null)
})

test('P3.14-04: pedidos por origem e unidade, aptos/bloqueados/liberados, intenção da Nuvemshop fora do confirmado, horas até liberar', () => {
  const p = (extra) => ({ origem: 'omie', unidade: 'Loja A', estado: 'apto', situacaoCanal: null, criadoEm: '2026-11-01T08:00:00Z', liberadoEm: null, ...extra })
  const r = relatorioPedidos([
    p({}),
    p({ estado: 'bloqueado' }),
    p({ estado: 'liberado', liberadoEm: '2026-11-01T20:00:00Z' }),
    p({ estado: 'liberado', liberadoEm: '2026-11-02T08:00:00Z' }),
    p({ origem: 'nuvemshop', situacaoCanal: 'intencao' }),
    p({ origem: 'nuvemshop', situacaoCanal: 'confirmado', unidade: null }),
  ])
  assert.equal(r.intencoes, 1)
  const a = r.confirmados.find((x) => x.origem === 'omie')
  assert.deepEqual([a.total, a.aptos, a.bloqueados, a.liberados], [4, 1, 1, 2])
  assert.equal(r.confirmados.find((x) => x.origem === 'nuvemshop').unidade, 'sem unidade')
  assert.deepEqual(r.horasAteLiberar, { media: 18, pedidos: 2 }) // (12 + 24) / 2
  assert.equal(relatorioPedidos([]).horasAteLiberar.media, null)
})

test('exportação CSV: aspas, ponto e vírgula e células que começam como fórmula são neutralizados; números ficam números', () => {
  const csv = paraCsv(['item', 'valor'], [['=SOMA(A1)', 1.5], ['a;b "c"', null], ['-2 caixas', 3]])
  assert.equal(csv, "item;valor\r\n'=SOMA(A1);1.5\r\n\"a;b \"\"c\"\"\";\r\n'-2 caixas;3")
})
