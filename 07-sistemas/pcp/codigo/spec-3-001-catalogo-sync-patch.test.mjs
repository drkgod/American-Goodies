// tests/pcp/spec-3-001-catalogo-sync-patch.test.mjs — patch do consultor (02/11/2026), sincronização do catálogo
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  classificarResposta,
  novoSync,
  executarSubLote,
  podeTomarTrava,
  guardaVigente,
  ESPERA_REPETICAO_MS,
} from '../../src/lib/pcp/catalogo-sync.ts'

const T0 = new Date('2026-11-03T12:00:00Z')

test('MISUSE_API_PROCESS é bloqueio (guarda), não erro nem "não encontrado"', () => {
  assert.deepEqual(classificarResposta(500, 'MISUSE_API_PROCESS: uso indevido', null), {
    tipo: 'bloqueado',
    motivo: 'misuse_api_process',
  })
})

test('401, 403 e 400 são erro de acesso, nunca "não encontrado"', () => {
  for (const s of [400, 401, 403, 429]) {
    assert.equal(classificarResposta(s, null, null).tipo, 'erro_acesso', 'status ' + s)
  }
  assert.equal(classificarResposta(404, null, null).tipo, 'nao_encontrado')
})

test('erro de acesso para o sub-lote sem avançar e sem virar faltante', () => {
  const e = novoSync(['A', 'B'])
  const r = executarSubLote(e, () => ({ tipo: 'erro_acesso', detalhe: 'http_401' }), {
    tamanho: 5,
    agora: T0,
  })
  assert.equal(r.parou, 'erro_acesso')
  assert.equal(r.estado.cursor, 0)
  assert.deepEqual(r.estado.naoEncontrados, [])
  assert.equal(r.estado.ultimoErro, 'http_401')
})

test('o mesmo código só é consultado de novo 60 s depois do erro', () => {
  let chamadas = 0
  const consultar = () => {
    chamadas += 1
    return { tipo: 'erro', detalhe: 'http_500' }
  }
  const e = novoSync(['A'])
  const r1 = executarSubLote(e, consultar, { tamanho: 5, agora: T0 })
  assert.equal(chamadas, 1)
  assert.equal(r1.estado.repetirApos, new Date(T0.getTime() + ESPERA_REPETICAO_MS).toISOString())
  const antes = executarSubLote(r1.estado, consultar, {
    tamanho: 5,
    agora: new Date(T0.getTime() + 59_000),
  })
  assert.equal(antes.parou, 'aguardando_repeticao')
  assert.equal(chamadas, 1, 'nenhuma chamada antes dos 60 s')
  const depois = executarSubLote(r1.estado, consultar, {
    tamanho: 5,
    agora: new Date(T0.getTime() + 60_000),
  })
  assert.equal(chamadas, 2)
  assert.equal(depois.parou, 'erro_transitorio')
})

test('trava: segunda rodada simultânea é recusada; trava velha é tomada', () => {
  assert.equal(podeTomarTrava(null, T0), true)
  assert.equal(podeTomarTrava(new Date(T0.getTime() - 30_000).toISOString(), T0), false)
  assert.equal(podeTomarTrava(new Date(T0.getTime() - 130_000).toISOString(), T0), true)
})

test('guarda do bloqueio vale mesmo sem a execução anterior', () => {
  assert.equal(guardaVigente(new Date(T0.getTime() + 1000).toISOString(), T0), true)
  assert.equal(guardaVigente(new Date(T0.getTime() - 1000).toISOString(), T0), false)
  assert.equal(guardaVigente(null, T0), false)
})
