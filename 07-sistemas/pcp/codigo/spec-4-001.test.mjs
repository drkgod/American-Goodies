// tests/pcp/spec-4-001.test.mjs — SPEC-4-001: produção gravando no servidor (cada teste leva o código do critério)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  produtoEhDemonstracao,
  registroEhDemonstracao,
  recusarDemonstracao,
} from '../../src/lib/pcp/demonstracao.ts'
import { decidirAprovacao } from '../../src/lib/pcp/producao-servidor.ts'

test('CA-4-34: produto de demonstração é reconhecido; produto real não', () => {
  for (const c of ['FARINHA-DEMO', 'cookie-1', 'INS-1', 'DEMO-9']) assert.equal(produtoEhDemonstracao(c), true, c)
  for (const c of ['M011001', 'M084073', '', null, undefined]) assert.equal(produtoEhDemonstracao(c), false, String(c))
})

test('CA-4-34: registro de conta de teste ou com produto de demonstração sai marcado; o real não', () => {
  assert.equal(registroEhDemonstracao({ contaDeTeste: true, produtos: ['M011001'] }), true)
  assert.equal(registroEhDemonstracao({ contaDeTeste: false, produtos: ['M011001', 'FARINHA-DEMO'] }), true)
  assert.equal(registroEhDemonstracao({ contaDeTeste: false, produtos: ['M011001'] }), false)
  assert.equal(registroEhDemonstracao({ contaDeTeste: false, produtos: [] }), false)
})

test('CA-4-34: a marca nunca sai sozinha depois de posta', () => {
  assert.equal(registroEhDemonstracao({ contaDeTeste: false, produtos: ['M011001'], jaMarcado: true }), true)
})

test('CA-4-34: autorização e envio recusam registro de demonstração com 422, com a chave ligada ou desligada', () => {
  for (const ligada of [true, false]) {
    const r = recusarDemonstracao({ demonstracao: true }, { ligada })
    assert.deepEqual(r, { http: 422, erro: 'registro_de_demonstracao' })
  }
  assert.equal(recusarDemonstracao({ demonstracao: false }, { ligada: true }), null)
  assert.equal(recusarDemonstracao({}, { ligada: true }), null)
})

test('CA-4-34: consolidação marcada como demonstração não prepara ordem', () => {
  const base = { aprovacao_id: 'AP-1', op_id: 'OP-3-001', quantidade_final: 96, motivo: 'ok', data_conclusao: '2026-11-12', expedicao: 97, camara: 96 }
  const real = decidirAprovacao(base)
  assert.equal(real.ordem.estado, 'preparada')
  const demo = decidirAprovacao({ ...base, demonstracao: true })
  assert.equal(demo.ok, true)
  assert.equal(demo.ordem, null)
  assert.match(demo.pendencias[0], /registro_de_demonstracao/)
})

// ---- CA-4-01 · CA-4-04: planejamento com parâmetros e calendário aprovados ----
import { situacaoPublicar, calendarioDosParametros, mensagemDaPublicacao, MENSAGEM_SEM_PARAMETROS } from '../../src/lib/pcp/planejamento-servidor.ts'
import { validarRascunho } from '../../src/lib/pcp/planejamento.ts'

const APROVADOS = {
  capacidade_padrao: 100, lote_multiplo: 10, horizonte_dias: 7,
  recursos: [{ nome: 'cookies', unidade: 'UN', capacidade_fracao: 1, dias_producao: [1, 2, 3] }, { nome: 'exclusivos', unidade: 'UN', capacidade_fracao: 1, dias_producao: [4, 5] }],
}

test('CA-4-01: sem parâmetros aprovados, Publicar fica desabilitado com o motivo', () => {
  assert.deepEqual(situacaoPublicar(null), { pode: false, motivo: MENSAGEM_SEM_PARAMETROS })
  assert.equal(situacaoPublicar({ ...APROVADOS, capacidade_padrao: null }).pode, false)
  assert.equal(situacaoPublicar({ ...APROVADOS, recursos: [] }).pode, false)
})

test('CA-4-01: sem calendário (dias de produção) em algum recurso, Publicar fica desabilitado', () => {
  const sem = { ...APROVADOS, recursos: [{ nome: 'cookies', unidade: 'UN', capacidade_fracao: 1 }] }
  assert.equal(situacaoPublicar(sem).pode, false)
  assert.equal(situacaoPublicar({ ...APROVADOS, recursos: [{ ...APROVADOS.recursos[0], dias_producao: [] }] }).pode, false)
  assert.equal(situacaoPublicar({ ...APROVADOS, recursos: [{ ...APROVADOS.recursos[0], unidade: null }] }).pode, false)
})

test('CA-4-01: com parâmetros e calendário aprovados, o calendário vem dos dias de cada recurso', () => {
  const s = situacaoPublicar(APROVADOS)
  assert.equal(s.pode, true)
  const cal = calendarioDosParametros(APROVADOS, '2026-11-09') // segunda
  assert.equal(cal.dias.length, 7)
  assert.deepEqual(cal.dias[0].recursos, ['cookies']) // seg
  assert.deepEqual(cal.dias[3].recursos, ['exclusivos']) // qui
  assert.deepEqual(cal.dias[5].recursos, []) // sáb: nenhum recurso
  const ok = validarRascunho({ linhas: [{ produto: 'M011001', quantidade: 50, data: '2026-11-09', recurso: 'cookies' }], parametros: s.parametros }, cal, s.recursos)
  assert.equal(ok.pode_publicar, true)
  const dia = validarRascunho({ linhas: [{ produto: 'M011001', quantidade: 50, data: '2026-11-14', recurso: 'cookies' }], parametros: s.parametros }, cal, s.recursos)
  assert.equal(dia.pode_publicar, false) // sábado sem recurso
})

test('CA-4-01: publicar sobre versão antiga devolve 409 e manda recarregar; a mesma versão aparece igual para todos', () => {
  const r = mensagemDaPublicacao(409, { versao_atual: 3 })
  assert.equal(r.ok, false)
  assert.equal(r.recarregar, true)
  assert.match(r.texto, /versão 3/)
  const ok = mensagemDaPublicacao(200, { versao: 4 })
  assert.deepEqual({ ok: ok.ok, rec: ok.recarregar }, { ok: true, rec: true })
})

test('CA-4-04: falta de acesso na publicação não dá pistas', () => {
  const t403 = mensagemDaPublicacao(403, null).texto
  const t401 = mensagemDaPublicacao(401, null).texto
  assert.equal(t403, t401)
  assert.doesNotMatch(t403, /área|perfil|permiss/i)
})
