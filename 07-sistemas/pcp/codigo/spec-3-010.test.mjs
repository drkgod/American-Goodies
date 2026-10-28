// tests/pcp/spec-3-010.test.mjs — SPEC-3-010 CA-3-30, CA-3-31, CA-3-32 (P3.10-01 a 04, 06 em fixture)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  aplicarRodada, chaveDoAlerta, parametroEfetivo, regraCompraSemPedido, regraDivergencia, regraEntregaAtrasada, regraEstoque,
  regraPedidoParado, regraPreco, regraProducao, resumoDeLacunas, validarParametros,
} from '../../src/lib/pcp/alertas.ts'

const AGORA = new Date('2026-10-28T12:00:00Z')
const HOJE = new Date('2026-10-28T00:00:00Z')
const params = {
  versao: 3, aprovador: 'pcp', aprovadoEm: '2026-10-27T10:00:00Z',
  itens: [
    { escopo: 'produto', chave: 'FARINHA-DEMO', estoqueMinimo: 10, prazoFornecedorDias: 5 },
    { escopo: 'familia', chave: 'SECOS', estoqueMinimo: 3, toleranciaPrecoPct: 10, atrasoAceitoDias: 2, compraSemPedidoDias: 3, tempoMaxParadoHoras: 48, prazoFornecedorDias: 9 },
  ],
  gravidade: { producao: 'atencao', compra: 'atencao', preco: 'atencao', pedido: 'atencao', divergencia: 'critico' },
}
const familias = { SECOS: ['farinha-demo', 'ACUCAR-DEMO'] }
const ef = (item) => parametroEfetivo(params, familias, item)
const dado = new Date('2026-10-28T11:00:00Z')

test('CA-3-30: o do produto prevalece sobre o da família, campo a campo; ausente é null (nunca padrão)', () => {
  const f = ef('FARINHA-DEMO')
  assert.equal(f.estoqueMinimo, 10) // produto
  assert.equal(f.prazoFornecedorDias, 5) // produto
  assert.equal(f.toleranciaPrecoPct, 10) // herdado da família
  const a = ef('ACUCAR-DEMO')
  assert.equal(a.estoqueMinimo, 3) // só família
  assert.equal(a.prazoFornecedorDias, 9)
  const sem = ef('ITEM-SEM-NADA')
  assert.deepEqual(Object.values(sem), [null, null, null, null, null, null])
  assert.deepEqual(Object.values(parametroEfetivo(null, familias, 'X')), [null, null, null, null, null, null])
})

test('validação de parâmetros: negativo, repetido e escopo inválido são recusados', () => {
  assert.ok(validarParametros([{ escopo: 'produto', chave: 'A', estoqueMinimo: -1 }]).length > 0)
  assert.ok(validarParametros([{ escopo: 'produto', chave: 'A' }, { escopo: 'produto', chave: 'a' }]).length > 0)
  assert.ok(validarParametros([{ escopo: 'outro', chave: 'A' }]).length > 0)
  assert.deepEqual(validarParametros(params.itens), [])
})

test('P3.10-01: item sem mínimo → lacuna e zero alerta', () => {
  const r = regraEstoque(params, ef('ITEM-SEM-NADA'), { item: 'ITEM-SEM-NADA', unidade: 'KG', saldo: 1, aReceber: [], consumoDia: 2, unidadeConsumo: 'KG', dadoEm: dado }, HOJE, AGORA)
  assert.ok('lacuna' in r)
  assert.equal(r.lacuna.campo, 'estoqueMinimo')
  const semPrazo = regraEstoque(params, { ...ef('FARINHA-DEMO'), prazoFornecedorDias: null }, { item: 'F', unidade: 'KG', saldo: 1, aReceber: [], consumoDia: 2, unidadeConsumo: 'KG', dadoEm: dado }, HOJE, AGORA)
  assert.equal(semPrazo.lacuna.campo, 'prazoFornecedorDias')
  assert.deepEqual(resumoDeLacunas([r.lacuna, semPrazo.lacuna]).total, 2)
})

test('P3.10-03: saldo 8 KG, a receber 0, consumo 2 KG/dia, mínimo 10, prazo 5 → ruptura prevista, crítico, com os números', () => {
  const r = regraEstoque(params, ef('FARINHA-DEMO'), { item: 'farinha-demo', unidade: 'KG', saldo: 8, aReceber: [], consumoDia: 2, unidadeConsumo: 'KG', dadoEm: dado }, HOJE, AGORA)
  assert.equal(r.alerta.tipo, 'estoque')
  assert.equal(r.alerta.gravidade, 'critico')
  assert.deepEqual([r.alerta.valores.saldo, r.alerta.valores.consumoDia, r.alerta.valores.minimo, r.alerta.valores.prazoDias, r.alerta.valores.projetado], [8, 2, 10, 5, -2])
  assert.equal(r.alerta.versaoParametros, 3)
  assert.equal(r.alerta.fonteDesatualizada, false)
})

test('estoque: compra chegando dentro do prazo evita o alerta; fora do prazo não conta; unidade incompatível é lacuna', () => {
  const base = { item: 'FARINHA-DEMO', unidade: 'KG', saldo: 8, consumoDia: 2, unidadeConsumo: 'KG', dadoEm: dado }
  const chega = regraEstoque(params, ef('FARINHA-DEMO'), { ...base, aReceber: [{ data: '2026-11-01', quantidade: 50 }] }, HOJE, AGORA)
  assert.ok('nenhum' in chega)
  const tarde = regraEstoque(params, ef('FARINHA-DEMO'), { ...base, aReceber: [{ data: '2026-12-01', quantidade: 50 }] }, HOJE, AGORA)
  assert.ok('alerta' in tarde)
  const un = regraEstoque(params, ef('FARINHA-DEMO'), { ...base, aReceber: [], unidadeConsumo: 'G' }, HOJE, AGORA)
  assert.equal(un.lacuna.campo, 'unidade')
  const atencao = regraEstoque(params, ef('FARINHA-DEMO'), { ...base, saldo: 40, aReceber: [], consumoDia: 5 }, HOJE, AGORA) // projetado 15 ≥ 10
  assert.ok('nenhum' in atencao)
  const att = regraEstoque(params, ef('FARINHA-DEMO'), { ...base, saldo: 30, aReceber: [], consumoDia: 4 }, HOJE, AGORA) // projetado 10 não < 10
  assert.ok('nenhum' in att)
  const abaixo = regraEstoque(params, ef('FARINHA-DEMO'), { ...base, saldo: 30, aReceber: [], consumoDia: 4.2 }, HOJE, AGORA) // 9 < 10, > 0
  assert.equal(abaixo.alerta.gravidade, 'atencao')
})

test('fonte desatualizada: o alerta leva a hora do dado e o aviso', () => {
  const velho = new Date('2026-10-26T12:00:00Z')
  const r = regraEstoque(params, ef('FARINHA-DEMO'), { item: 'FARINHA-DEMO', unidade: 'KG', saldo: 8, aReceber: [], consumoDia: 2, unidadeConsumo: 'KG', dadoEm: velho }, HOJE, AGORA)
  assert.equal(r.alerta.fonteDesatualizada, true)
  assert.equal(r.alerta.dadoEm, velho.toISOString())
})

test('P3.10-04: um caso de cada um dos seis tipos, com os números usados', () => {
  const prod = regraProducao(params, { item: 'BOLO-DEMO', ordem: 'OP1', diaProgramado: '2026-10-26', iniciada: false, dadoEm: dado }, HOJE, AGORA)
  assert.equal(prod.alerta.tipo, 'producao')
  assert.equal(prod.alerta.valores.diasDeAtraso, 2)
  assert.ok('nenhum' in regraProducao(params, { item: 'B', ordem: 'OP2', diaProgramado: '2026-10-26', iniciada: true, dadoEm: dado }, HOJE, AGORA))
  const ent = regraEntregaAtrasada(params, ef('FARINHA-DEMO'), { item: 'FARINHA-DEMO', pedido: '1001', dataPrevista: '2026-10-20', restante: 30, dadoEm: dado }, HOJE, AGORA)
  assert.equal(ent.alerta.tipo, 'compra')
  assert.equal(ent.alerta.valores.diasDeAtraso, 8)
  assert.ok('nenhum' in regraEntregaAtrasada(params, ef('FARINHA-DEMO'), { item: 'F', pedido: '1', dataPrevista: '2026-10-27', restante: 30, dadoEm: dado }, HOJE, AGORA)) // dentro do aceito
  assert.ok('nenhum' in regraEntregaAtrasada(params, ef('FARINHA-DEMO'), { item: 'F', pedido: '1', dataPrevista: '2026-10-01', restante: 0, dadoEm: dado }, HOJE, AGORA)) // nada a receber
  const sem = regraCompraSemPedido(params, ef('FARINHA-DEMO'), { item: 'FARINHA-DEMO', requisicao: 'R1', aprovadaEm: new Date('2026-10-20T12:00:00Z'), temPedido: false, dadoEm: dado }, AGORA)
  assert.equal(sem.alerta.valores.diasSemPedido, 8)
  assert.ok('nenhum' in regraCompraSemPedido(params, ef('FARINHA-DEMO'), { item: 'F', requisicao: 'R2', aprovadaEm: new Date('2026-10-20T12:00:00Z'), temPedido: true, dadoEm: dado }, AGORA))
  const preco = regraPreco(params, ef('FARINHA-DEMO'), { item: 'FARINHA-DEMO', referencia: 'R1', precoPorUnidadeEstoque: 11.5, ultimoPreco: 10, dadoEm: dado }, AGORA)
  assert.equal(preco.alerta.valores.diferencaPct, 15)
  assert.ok('nenhum' in regraPreco(params, ef('FARINHA-DEMO'), { item: 'F', referencia: 'R', precoPorUnidadeEstoque: 10.5, ultimoPreco: 10, dadoEm: dado }, AGORA))
  const ped = regraPedidoParado(params, 48, { pedido: 'P1', motivo: 'bloqueado_para_faturar', desde: new Date('2026-10-25T12:00:00Z'), dadoEm: dado }, AGORA)
  assert.equal(ped.alerta.valores.horasParado, 72)
  const intencao = regraPedidoParado(params, 48, { pedido: 'P2', motivo: 'intencao_pendente', desde: new Date('2026-10-20T12:00:00Z'), dadoEm: dado }, AGORA)
  assert.equal(intencao.alerta.referencia, 'intencao_pendente')
  const div = regraDivergencia(params, { conferencia: 'C1', item: 'FARINHA-DEMO', temDiferenca: true, decididaPeloPcp: false, diferenca: -3, dadoEm: dado }, AGORA)
  assert.equal(div.alerta.gravidade, 'critico')
  assert.ok('nenhum' in regraDivergencia(params, { conferencia: 'C1', item: 'F', temDiferenca: true, decididaPeloPcp: true, diferenca: -3, dadoEm: dado }, AGORA))
  const tipos = [prod, ent, sem, preco, ped, div].map((r) => r.alerta.tipo)
  assert.deepEqual(new Set(tipos), new Set(['producao', 'compra', 'preco', 'pedido', 'divergencia']))
})

test('parâmetro ausente: sem tolerância, sem atraso aceito, sem tempo e sem gravidade → lacuna, nenhum alerta', () => {
  const vazio = parametroEfetivo(params, familias, 'OUTRO')
  assert.equal(regraPreco(params, vazio, { item: 'O', referencia: 'R', precoPorUnidadeEstoque: 20, ultimoPreco: 10, dadoEm: dado }, AGORA).lacuna.campo, 'toleranciaPrecoPct')
  assert.equal(regraEntregaAtrasada(params, vazio, { item: 'O', pedido: '1', dataPrevista: '2026-01-01', restante: 5, dadoEm: dado }, HOJE, AGORA).lacuna.campo, 'atrasoAceitoDias')
  assert.equal(regraPedidoParado(params, null, { pedido: 'P', motivo: 'bloqueado_para_faturar', desde: new Date('2026-01-01'), dadoEm: dado }, AGORA).lacuna.campo, 'tempoMaxParadoHoras')
  const semGrav = { ...params, gravidade: {} }
  assert.equal(regraDivergencia(semGrav, { conferencia: 'C', item: 'F', temDiferenca: true, decididaPeloPcp: false, diferenca: 1, dadoEm: dado }, AGORA).lacuna.campo, 'gravidade')
  assert.equal(regraPreco(params, ef('FARINHA-DEMO'), { item: 'F', referencia: 'R', precoPorUnidadeEstoque: null, ultimoPreco: 10, dadoEm: dado }, AGORA).lacuna.campo, 'preco')
  assert.equal(regraPreco(params, ef('FARINHA-DEMO'), { item: 'F', referencia: 'R', precoPorUnidadeEstoque: 10, ultimoPreco: null, dadoEm: dado }, AGORA).lacuna.campo, 'historico')
})

test('P3.10-02: mesma situação em duas rodadas → um alerta, atualizado (não cria outro)', () => {
  const entrada = (saldo) => ({ item: 'FARINHA-DEMO', unidade: 'KG', saldo, aReceber: [], consumoDia: 2, unidadeConsumo: 'KG', dadoEm: dado })
  const a1 = regraEstoque(params, ef('FARINHA-DEMO'), entrada(8), HOJE, AGORA).alerta
  const r1 = aplicarRodada([], [a1], AGORA)
  assert.equal(r1.criados, 1)
  const depois = new Date('2026-10-29T12:00:00Z')
  const a2 = regraEstoque(params, ef('FARINHA-DEMO'), entrada(6), HOJE, depois).alerta
  const r2 = aplicarRodada(r1.lista, [a2], depois)
  assert.equal(r2.lista.length, 1)
  assert.equal(r2.atualizados, 1)
  assert.equal(r2.lista[0].valores.saldo, 6)
  assert.equal(r2.lista[0].atualizacoes, 1)
  assert.equal(r2.lista[0].abertoEm, AGORA.toISOString())
  assert.equal(r2.lista[0].atualizadoEm, depois.toISOString())
  // duplicado dentro da mesma rodada também não cria dois
  assert.equal(aplicarRodada([], [a1, a1], AGORA).lista.length, 1)
  // alerta tratado: nova ocorrência abre outro, com número de ocorrência seguinte
  const tratado = r1.lista.map((a) => ({ ...a, estado: 'tratado' }))
  const r3 = aplicarRodada(tratado, [a2], depois)
  assert.equal(r3.lista.length, 2)
  assert.equal(r3.lista[1].ocorrencia, 2)
})

test('chave do alerta: regra + item + referência; item em caixa diferente é o mesmo; nenhum alerta carrega ação', () => {
  assert.equal(chaveDoAlerta('compra', 'farinha-demo', 'entrega:1'), chaveDoAlerta('compra', ' FARINHA-DEMO ', 'entrega:1'))
  assert.notEqual(chaveDoAlerta('compra', 'F', 'entrega:1'), chaveDoAlerta('compra', 'F', 'entrega:2'))
  const a = regraEstoque(params, ef('FARINHA-DEMO'), { item: 'FARINHA-DEMO', unidade: 'KG', saldo: 8, aReceber: [], consumoDia: 2, unidadeConsumo: 'KG', dadoEm: dado }, HOJE, AGORA).alerta
  for (const proibido of ['acao', 'acoes', 'comprar', 'publicarOrdem', 'alterarParametro', 'financeiro']) assert.equal(proibido in a, false)
})
