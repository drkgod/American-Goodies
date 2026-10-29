// tests/pcp/spec-3-011.test.mjs — SPEC-3-011 CA-3-33, CA-3-34 (P3.11-01 a 05, em fixture)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { aplicarRodada, parametroEfetivo, regraEstoque } from '../../src/lib/pcp/alertas.ts'
import {
  agrupar, assumir, contarAbertosVisiveis, ehGestao, filtrarGerados, incluirNoHistorico, mudarRegra, regraAtiva, tratar, veAlerta,
} from '../../src/lib/pcp/tratamento-alertas.ts'

const AGORA = new Date('2026-10-29T12:00:00Z')
const pcp = { ativo: true, areas: ['planejamento'], acoes: ['tratar_alerta', 'editar_parametros'] }
const compras = { ativo: true, areas: ['compras'], acoes: ['tratar_alerta'] }
const compras2 = { ativo: true, areas: ['compras'], acoes: ['tratar_alerta'] }
const fatur = { ativo: true, areas: ['faturamento'], acoes: ['tratar_alerta'] }
const semAcao = { ativo: true, areas: ['compras'], acoes: [] }
const gestao = { ativo: true, areas: ['planejamento', 'compras', 'faturamento'], acoes: ['tratar_alerta'] }
const ruptura = { id: 'A1', tipo: 'estoque', estado: 'aberto', versao: 1, responsavel: null, anteriorId: null }
const comprasAlerta = { ...ruptura, id: 'A2', tipo: 'compra' }

test('RN-02: cada área vê só os seus; destinatário por tipo; gestão vê todos', () => {
  assert.equal(veAlerta(pcp, 'estoque'), true)
  assert.equal(veAlerta(pcp, 'producao'), true)
  assert.equal(veAlerta(pcp, 'divergencia'), true)
  assert.equal(veAlerta(pcp, 'preco'), false)
  assert.equal(veAlerta(compras, 'preco'), true)
  assert.equal(veAlerta(compras, 'compra'), true)
  assert.equal(veAlerta(compras, 'pedido'), false)
  assert.equal(veAlerta(fatur, 'pedido'), true)
  assert.equal(veAlerta(fatur, 'estoque'), false)
  assert.equal(ehGestao(gestao), true)
  for (const t of ['estoque', 'compra', 'preco', 'pedido', 'divergencia', 'producao']) assert.equal(veAlerta(gestao, t), true)
  assert.equal(veAlerta(null, 'estoque'), false)
  assert.equal(veAlerta({ ...pcp, ativo: false }, 'estoque'), false)
  assert.equal(veAlerta(pcp, 'tipo_inexistente'), false)
})

test('P3.11-02: perfil do PCP tenta assumir/tratar alerta de preço → negado sem pistas (igual a quem não tem a ação)', () => {
  const preco = { ...ruptura, id: 'A3', tipo: 'preco' }
  const deOutraArea = assumir({ perfil: pcp, usuario: 'pcp', alerta: preco, versaoEsperada: 1, agora: AGORA })
  const semAcaoR = assumir({ perfil: semAcao, usuario: 'x', alerta: preco, versaoEsperada: 1, agora: AGORA })
  assert.deepEqual(deOutraArea, { ok: false, http: 403, erro: 'sem_permissao' })
  assert.deepEqual(semAcaoR, deOutraArea)
  assert.deepEqual(assumir({ perfil: null, usuario: 'x', alerta: preco, versaoEsperada: 1, agora: AGORA }), deOutraArea)
})

test('P3.11-01: tratar sem ação registrada é recusado; indevido e outra exigem texto', () => {
  const emAnalise = assumir({ perfil: compras, usuario: 'comp', alerta: comprasAlerta, versaoEsperada: 1, agora: AGORA }).alerta
  const base = { perfil: compras, usuario: 'comp', alerta: emAnalise, versaoEsperada: 2, agora: AGORA }
  for (const acao of [null, '', 'qualquer_coisa']) assert.equal(tratar({ ...base, acao }).http, 422)
  assert.equal(tratar({ ...base, acao: 'alerta_indevido' }).http, 422)
  assert.equal(tratar({ ...base, acao: 'outra', texto: ' ' }).http, 422)
  assert.equal(tratar({ ...base, acao: 'alerta_indevido', texto: 'item já recebido' }).ok, true)
})

test('P3.11-03: ciclo completo de uma ruptura — Compras assume e registra "compra solicitada" com autor e hora', () => {
  let h = []
  const a1 = assumir({ perfil: compras, usuario: 'comp', alerta: { ...ruptura, tipo: 'compra' }, versaoEsperada: 1, agora: AGORA })
  assert.equal(a1.alerta.estado, 'em_analise')
  assert.equal(a1.alerta.responsavel, 'comp')
  h = incluirNoHistorico(h, a1.evento)
  const t = tratar({ perfil: compras, usuario: 'comp', alerta: a1.alerta, versaoEsperada: 2, acao: 'compra_solicitada', agora: new Date('2026-10-29T13:00:00Z') })
  assert.equal(t.alerta.estado, 'tratado')
  assert.equal(t.evento.autor, 'comp')
  assert.equal(t.evento.em, '2026-10-29T13:00:00.000Z')
  assert.equal(t.evento.detalhe, 'compra_solicitada')
  const h2 = incluirNoHistorico(h, t.evento)
  assert.equal(h2.length, 2)
  assert.equal(h.length, 1) // o histórico anterior não foi alterado
  // só o responsável trata; tratado não volta a ser assumido
  assert.equal(tratar({ perfil: compras2, usuario: 'outra', alerta: a1.alerta, versaoEsperada: 2, acao: 'compra_solicitada', agora: AGORA }).http, 409)
  assert.equal(assumir({ perfil: compras, usuario: 'comp', alerta: t.alerta, versaoEsperada: 3, agora: AGORA }).http, 409)
})

test('P3.11-04: duas pessoas assumem juntas → uma consegue; a outra recebe 409', () => {
  const a = assumir({ perfil: compras, usuario: 'ana', alerta: comprasAlerta, versaoEsperada: 1, agora: AGORA })
  assert.equal(a.ok, true)
  // a segunda pessoa ainda via a versão 1; o servidor já está na 2 e o alerta já está em análise
  const b = assumir({ perfil: compras2, usuario: 'beto', alerta: a.alerta, versaoEsperada: 1, agora: AGORA })
  assert.deepEqual([b.ok, b.http, b.erro], [false, 409, 'conflito_de_versao'])
})

test('RN-03: condição que volta depois de tratado gera alerta novo ligado ao anterior', () => {
  const params = { versao: 1, aprovador: 'p', aprovadoEm: '', itens: [{ escopo: 'produto', chave: 'F', estoqueMinimo: 10, prazoFornecedorDias: 5 }], gravidade: {} }
  const ef = parametroEfetivo(params, {}, 'F')
  const gerar = (saldo) => regraEstoque(params, ef, { item: 'F', unidade: 'KG', saldo, aReceber: [], consumoDia: 2, unidadeConsumo: 'KG', dadoEm: AGORA }, new Date('2026-10-29T00:00:00Z'), AGORA).alerta
  const r1 = aplicarRodada([], [gerar(8)], AGORA)
  assert.equal(r1.lista[0].anteriorOcorrencia, null)
  const tratado = r1.lista.map((x) => ({ ...x, estado: 'tratado' }))
  const r2 = aplicarRodada(tratado, [gerar(7)], AGORA)
  assert.equal(r2.lista.length, 2)
  assert.equal(r2.lista[1].anteriorOcorrencia, 1)
  assert.equal(r2.lista[1].estado, 'aberto')
  // alerta em análise também é atualizado, não duplicado
  const emAnalise = r1.lista.map((x) => ({ ...x, estado: 'em_analise' }))
  assert.equal(aplicarRodada(emAnalise, [gerar(6)], AGORA).lista.length, 1)
})

test('RN-05: alertas do mesmo tipo e item ficam agrupados; o grupo leva a maior gravidade; contador por área', () => {
  const l = [
    { tipo: 'compra', item: 'F', gravidade: 'atencao', estado: 'aberto' },
    { tipo: 'compra', item: 'F', gravidade: 'critico', estado: 'em_analise' },
    { tipo: 'preco', item: 'F', gravidade: 'atencao', estado: 'aberto' },
    { tipo: 'estoque', item: 'F', gravidade: 'critico', estado: 'tratado' },
  ]
  const g = agrupar(l)
  assert.equal(g.length, 3)
  assert.deepEqual([g[0].total, g[0].gravidade], [2, 'critico'])
  assert.equal(contarAbertosVisiveis(compras, l), 3)
  assert.equal(contarAbertosVisiveis(pcp, l), 0) // o de estoque está tratado
  assert.equal(contarAbertosVisiveis(fatur, l), 0)
  assert.equal(contarAbertosVisiveis(gestao, l), 3)
})

test('P3.11-05: regra desligada para de gerar e o histórico é mantido; só editar_parametros muda a regra', () => {
  assert.equal(mudarRegra({ perfil: compras, usuario: 'c', tipo: 'preco', ativa: false, regras: [], agora: AGORA }).http, 403)
  const m = mudarRegra({ perfil: pcp, usuario: 'pcp', tipo: 'preco', ativa: false, regras: [], agora: AGORA })
  assert.equal(m.ok, true)
  assert.equal(regraAtiva(m.regras, 'preco'), false)
  assert.equal(regraAtiva(m.regras, 'compra'), true)
  const gerados = [{ tipo: 'preco' }, { tipo: 'compra' }]
  assert.deepEqual(filtrarGerados(gerados, m.regras), [{ tipo: 'compra' }])
  const existentes = [{ chave: 'preco|F|R', tipo: 'preco', ocorrencia: 1, estado: 'aberto', valores: {}, atualizacoes: 0 }]
  const r = aplicarRodada(existentes, filtrarGerados(gerados.map((g) => ({ ...g, chave: g.tipo + '|X|R' })), m.regras), AGORA)
  assert.ok(r.lista.some((a) => a.chave === 'preco|F|R')) // o alerta que já existia não foi apagado
  const h = incluirNoHistorico([], m.evento)
  assert.equal(h[0].evento, 'regra_desligada')
  const religa = mudarRegra({ perfil: pcp, usuario: 'pcp', tipo: 'preco', ativa: true, regras: m.regras, agora: AGORA })
  assert.equal(regraAtiva(religa.regras, 'preco'), true)
  assert.equal(religa.regras.length, 1)
})
