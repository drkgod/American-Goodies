// tests/pcp/spec-3-019-producao-servidor.test.mjs — patch de 02/11/2026: produção guardada no servidor
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  validarProgramacao,
  ordensDaProgramacao,
  decidirPublicacao,
  realizadoDoPonto,
  decidirAprovacao,
  ordemAnteriorPodeSerSubstituida,
} from '../../src/lib/pcp/producao-servidor.ts'

const L = (o = {}) => ({ produto: 'cookie-1', quantidade: 100, data: '2026-11-10', recurso: 'cookies', ...o })

test('programação: linha sem quantidade positiva, data ou recurso é recusada', () => {
  assert.equal(validarProgramacao([L()]).ok, true)
  assert.equal(validarProgramacao([]).ok, false)
  assert.equal(validarProgramacao([L({ quantidade: -3 })]).ok, false)
  assert.equal(validarProgramacao([L({ data: '10/11/2026' })]).ok, false)
  assert.equal(validarProgramacao([L({ recurso: '' })]).ok, false)
})

test('ordens: uma por linha, com número estável pela versão', () => {
  const o = ordensDaProgramacao(3, [L(), L({ produto: 'b' })])
  assert.deepEqual(o.map((x) => x.op_id), ['OP-3-001', 'OP-3-002'])
  assert.equal(o[0].produto, 'COOKIE-1')
})

test('publicação: versão esperada diferente da atual dá conflito sem sobrescrever', () => {
  assert.deepEqual(decidirPublicacao(2, 2), { ok: true, versao: 3 })
  const r = decidirPublicacao(3, 2)
  assert.equal(r.ok, false)
  assert.equal(r.http, 409)
})

test('realizado eficaz do ponto soma incrementos e ignora o retificado', () => {
  const ev = [
    { evento_id: 'a', tipo: 'realizado', ponto: 'cozinha', quantidade: 40 },
    { evento_id: 'b', tipo: 'realizado', ponto: 'cozinha', quantidade: 60 },
    { evento_id: 'c', tipo: 'realizado', ponto: 'cozinha', quantidade: 55, retifica: 'b' },
    { evento_id: 'd', tipo: 'retirada', ponto: 'cozinha', quantidade: 6 },
    { evento_id: 'e', tipo: 'realizado', ponto: 'encaixotamento', quantidade: 90 },
  ]
  assert.equal(realizadoDoPonto(ev, 'cozinha'), 95)
  assert.equal(realizadoDoPonto(ev, 'encaixotamento'), 90)
})

const A = (o = {}) => ({
  aprovacao_id: 'AP-1', op_id: 'OP-3-001', quantidade_final: 96, motivo: 'aceito 96 após revisão',
  data_conclusao: '2026-11-12', expedicao: 97, camara: 96, ...o,
})

test('aprovação com conferências e quantidade positiva prepara a ordem (sem enviar)', () => {
  const r = decidirAprovacao(A())
  assert.equal(r.ok, true)
  assert.equal(r.ordem.estado, 'preparada')
  assert.equal(r.ordem.quantidade, 96)
  assert.equal(r.ordem.payload.nQtdeProduzida, 96)
  assert.equal(r.ordem.payload.dDtConclusao, '12/11/2026')
  assert.equal(r.ordem.payload.cCodIntOP, 'OP-3-001')
})

test('aprovação: conferência ausente nunca vira 0; sem motivo e quantidade negativa são recusadas', () => {
  assert.equal(decidirAprovacao(A({ camara: null })).erro, 'conferencia_ausente')
  assert.equal(decidirAprovacao(A({ expedicao: null })).erro, 'conferencia_ausente')
  assert.equal(decidirAprovacao(A({ motivo: '  ' })).erro, 'motivo_obrigatorio')
  assert.equal(decidirAprovacao(A({ quantidade_final: -1 })).erro, 'quantidade_invalida')
})

test('aprovação com quantidade final 0 é registrada e não prepara ordem', () => {
  const r = decidirAprovacao(A({ quantidade_final: 0 }))
  assert.equal(r.ok, true)
  assert.equal(r.ordem, null)
  assert.match(r.pendencias[0], /quantidade_final_zero/)
})

test('data de conclusão inválida recusa a ordem', () => {
  assert.equal(decidirAprovacao(A({ data_conclusao: '12-11-2026' })).erro, 'payload_invalido')
})

test('ordem já enviada não é substituída por nova aprovação', () => {
  for (const s of ['preparada', 'autorizada', 'bloqueada']) assert.equal(ordemAnteriorPodeSerSubstituida(s), true)
  for (const s of ['enviando', 'resultado_incerto', 'confirmada']) assert.equal(ordemAnteriorPodeSerSubstituida(s), false)
})
