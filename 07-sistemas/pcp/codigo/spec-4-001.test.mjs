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
