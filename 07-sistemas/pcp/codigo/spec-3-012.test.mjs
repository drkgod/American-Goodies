// tests/pcp/spec-3-012.test.mjs — SPEC-3-012 CA-3-35, CA-3-36 (P3.12-01 a 03, em fixture)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  agregarPorMes, comparar, coberturaDoCiclo, linhasDoPedido, sugerirAntecipacao, validarRegra, HISTORICO_INSUFICIENTE,
} from '../../src/lib/pcp/historico-vendas.ts'

const mesesDe = (de, ate) => {
  const out = []
  let [a, m] = de.split('-').map(Number)
  const [fa, fm] = ate.split('-').map(Number)
  while (a < fa || (a === fa && m <= fm)) {
    out.push(`${a}-${String(m).padStart(2, '0')}`)
    m++
    if (m > 12) { m = 1; a++ }
  }
  return out
}
const regra2 = { versao: 1, aprovador: 'pcp', ciclosMinimos: 2, coberturaMinimaPct: 90 }

// série de demonstração: 100 por mês, dezembro 130 (30% acima da média ~102,5 → ver teste)
function serieDemo(de, ate) {
  const linhas = []
  const lidos = new Set()
  for (const per of mesesDe(de, ate)) {
    lidos.add(per)
    linhas.push({ produto: 'FARINHA-DEMO', quantidade: per.endsWith('-12') ? 130 : 100, dataFaturamento: per + '-15' })
  }
  return { serie: agregarPorMes(linhas), lidos }
}

test('P3.12-01: um ano de dados e regra de dois ciclos → histórico insuficiente, sem sazonalidade', () => {
  const { serie, lidos } = serieDemo('2025-01', '2026-11')
  const c = comparar({ produto: 'farinha-demo', periodoAtual: '2026-12', serie, lidos: new Set([...lidos].filter((x) => x >= '2025-01')), regra: regra2 })
  // só 2025-12 tem 12 meses antes dele completos? 2025-12 cobre 2025-01..2025-12 (12 meses lidos): 1 ciclo
  assert.equal(c.suficiente, false)
  assert.equal(c.sazonalidadePct, null)
  assert.ok(c.mensagem.startsWith(HISTORICO_INSUFICIENTE))
  assert.equal(c.variacaoSobreAnosAnterioresPct, null)
})

test('P3.12-02: sem regra aprovada → histórico insuficiente mesmo com muitos anos', () => {
  const { serie, lidos } = serieDemo('2023-01', '2026-11')
  const c = comparar({ produto: 'FARINHA-DEMO', periodoAtual: '2026-12', serie, lidos, regra: null })
  assert.equal(c.suficiente, false)
  assert.equal(c.sazonalidadePct, null)
  assert.ok(c.mensagem.includes('regra de suficiência'))
  const s = sugerirAntecipacao(c, '2026-12-01', 10)
  assert.equal(s.sugerir, false)
  assert.equal(s.dataSugeridaDeCompra, null)
})

test('P3.12-03: dois anos completos, dezembro acima da média, prazo 10 dias → contexto e data sugerida', () => {
  const { serie, lidos } = serieDemo('2024-01', '2026-11')
  // atual: dezembro de 2026 ainda sem leitura; comparamos com 2025-12 e 2024-12
  const c = comparar({ produto: 'FARINHA-DEMO', periodoAtual: '2026-12', serie, lidos, regra: regra2 })
  assert.equal(c.suficiente, true)
  assert.equal(c.ciclos.length >= 2, true)
  const c25 = c.ciclos.find((x) => x.periodo === '2025-12')
  assert.equal(c25.quantidade, 130)
  assert.equal(c25.coberturaPct, 100)
  assert.ok(c25.indiceSobreMediaPct > 25 && c25.indiceSobreMediaPct < 30) // 130 contra média de 102,5
  assert.ok(c.sazonalidadePct > 25)
  const s = sugerirAntecipacao(c, '2026-12-01', 10)
  assert.equal(s.sugerir, true)
  assert.equal(s.dataSugeridaDeCompra, '2026-11-21') // data necessária − 10 dias
  assert.ok(s.texto.includes('10 dias'))
  assert.ok(s.texto.includes('21/11/2026'))
  assert.equal(/perda/i.test(s.texto), false) // diferença nunca é chamada de perda
})

test('sem prazo do fornecedor: sugere olhar o mês, mas sem data; sazonalidade negativa não sugere antecipar', () => {
  const { serie, lidos } = serieDemo('2024-01', '2026-11')
  const c = comparar({ produto: 'FARINHA-DEMO', periodoAtual: '2026-12', serie, lidos, regra: regra2 })
  const s = sugerirAntecipacao(c, '2026-12-01', null)
  assert.equal(s.sugerir, true)
  assert.equal(s.dataSugeridaDeCompra, null)
  const baixo = comparar({ produto: 'FARINHA-DEMO', periodoAtual: '2026-03', serie, lidos, regra: regra2 })
  const sb = sugerirAntecipacao(baixo, '2026-03-01', 10)
  assert.equal(sb.sugerir, false)
})

test('meses sem leitura: cobertura incompleta mostrada e sem sazonalidade', () => {
  const { serie, lidos } = serieDemo('2024-01', '2026-11')
  for (const m of ['2025-03', '2025-04', '2025-05', '2025-06', '2025-07']) lidos.delete(m)
  assert.equal(coberturaDoCiclo('2025-12', lidos), Math.round((7 / 12) * 10000) / 100)
  const c = comparar({ produto: 'FARINHA-DEMO', periodoAtual: '2026-12', serie, lidos, regra: regra2 })
  assert.equal(c.suficiente, false) // 2025-12 tem cobertura 58,33% < 90; 2024-12 cobre 100%, mas é 1 ciclo só
  assert.equal(c.sazonalidadePct, null)
  assert.equal(c.ciclos.find((x) => x.periodo === '2025-12').coberturaPct < 90, true)
  // mês sem leitura nunca vira zero
  lidos.delete('2025-12')
  const c2 = comparar({ produto: 'FARINHA-DEMO', periodoAtual: '2026-12', serie, lidos, regra: regra2 })
  assert.equal(c2.ciclos.find((x) => x.periodo === '2025-12').quantidade, null)
  assert.equal(c2.atual.quantidade, null)
})

test('período atual lido entra na comparação; produto sem vendas no mês lido é zero, não ausente', () => {
  const { serie, lidos } = serieDemo('2024-01', '2026-12')
  const c = comparar({ produto: 'FARINHA-DEMO', periodoAtual: '2026-12', serie, lidos, regra: regra2 })
  assert.equal(c.atual.quantidade, 130)
  assert.ok(Math.abs(c.variacaoSobreAnosAnterioresPct) < 0.01) // 130 contra a média de 130
  const outro = comparar({ produto: 'PRODUTO-SEM-VENDA', periodoAtual: '2026-12', serie, lidos, regra: regra2 })
  assert.equal(outro.atual.quantidade, 0)
  assert.equal(outro.suficiente, true)
  assert.equal(outro.sazonalidadePct, null) // média zero: sem índice
})

test('agregação do Omie: só faturado com data; cancelado, denegado e devolvido ficam de fora; sem quantidade não vira zero', () => {
  const ok = { infoCadastro: { faturado: 'S', dFat: '15/12/2025' }, det: [{ produto: { codigo: 'a-1', quantidade: 3 } }, { produto: { codigo_produto: 99, quantidade: 'x' } }, { produto: { codigo: '', quantidade: 2 } }] }
  assert.deepEqual(linhasDoPedido(ok), [{ produto: 'A-1', quantidade: 3, dataFaturamento: '2025-12-15' }])
  for (const ruim of [{ cancelado: 'S' }, { denegado: 'S' }, { devolvido: 'S' }, { devolvido_parcial: 'S' }]) {
    assert.deepEqual(linhasDoPedido({ ...ok, infoCadastro: { faturado: 'S', dFat: '15/12/2025', ...ruim } }), [])
  }
  assert.deepEqual(linhasDoPedido({ ...ok, infoCadastro: { faturado: 'S', dFat: '' } }), [])
  assert.deepEqual(linhasDoPedido({ ...ok, infoCadastro: { faturado: 'N', dFat: '15/12/2025' } }), [])
  const s = agregarPorMes([...linhasDoPedido(ok), ...linhasDoPedido(ok)])
  assert.equal(s['A-1']['2025-12'], 6)
})

test('regra de suficiência: valores inválidos são recusados', () => {
  assert.ok(validarRegra({ ciclosMinimos: 0, coberturaMinimaPct: 90 }).length > 0)
  assert.ok(validarRegra({ ciclosMinimos: 2, coberturaMinimaPct: 0 }).length > 0)
  assert.ok(validarRegra({ ciclosMinimos: 2.5, coberturaMinimaPct: 101 }).length === 2)
  assert.deepEqual(validarRegra({ ciclosMinimos: 2, coberturaMinimaPct: 90 }), [])
})
