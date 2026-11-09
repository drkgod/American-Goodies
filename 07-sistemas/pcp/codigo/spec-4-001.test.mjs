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

// ---- CA-4-02 · CA-4-05 (tela Apontamentos): apontamentos pelo servidor ----
import { readFileSync } from 'node:fs'
import {
  novoEventoId, assinaturaDoFormulario, validarFormulario, mensagemDoApontamento, eventosEficazes, resumoDaOrdem,
} from '../../src/lib/pcp/apontamento-servidor.ts'

const FORM = { tipo: 'retirada', item: 'INS-1', quantidade: 6, unidade: 'KG', motivo: '' }
const EV = (id, o = {}) => ({ evento_id: id, op_id: 'OP-1', ponto: 'cozinha', tipo: 'retirada', item: 'INS-1', quantidade: 6, unidade: 'KG', motivo: null, retifica: null, autor: 'u', ...o })

test('CA-4-02: o identificador do evento nasce na tela, é único e a mesma tentativa mantém a assinatura', () => {
  const a = novoEventoId(), b = novoEventoId()
  assert.match(a, /^EV-/)
  assert.notEqual(a, b)
  assert.equal(assinaturaDoFormulario('OP-1', 'cozinha', FORM), assinaturaDoFormulario('OP-1', 'cozinha', { ...FORM }))
  assert.notEqual(assinaturaDoFormulario('OP-1', 'cozinha', FORM), assinaturaDoFormulario('OP-1', 'cozinha', { ...FORM, quantidade: 7 }))
})

test('CA-4-02: reenvio do mesmo evento mostra "já registrado" e não duplica', () => {
  const r = mensagemDoApontamento(200, { ok: true, estado: 'replay' })
  assert.equal(r.ok, true)
  assert.match(r.texto, /já estava registrado/)
  assert.equal(r.recarregar, true)
  assert.match(mensagemDoApontamento(200, { ok: true, estado: 'registrado' }).texto, /registrado/)
})

test('CA-4-02: falha de rede mantém o identificador para o reenvio; erro do servidor definitivo troca', () => {
  assert.equal(mensagemDoApontamento(0, null).manterId, true)
  assert.equal(mensagemDoApontamento(500, null).manterId, true)
  assert.equal(mensagemDoApontamento(422, { erro: 'tipo_invalido' }).manterId, false)
  assert.equal(mensagemDoApontamento(409, { erro: 'conflito_hash' }).manterId, false)
})

test('CA-4-02: um apontamento gravado volta na leitura do servidor, com o resumo por item e por ponto', () => {
  const eventos = [
    EV('e1'), EV('e2', { tipo: 'adicional', quantidade: 1 }), EV('e3', { tipo: 'devolucao', quantidade: 0.5 }),
    EV('e4', { tipo: 'perda', quantidade: 0.2 }), EV('e5', { tipo: 'realizado', item: 'COOKIE', quantidade: 40, unidade: 'UN' }),
    EV('e6', { tipo: 'realizado', item: 'COOKIE', quantidade: 60, unidade: 'UN' }),
    EV('e7', { tipo: 'realizado', item: 'COOKIE', quantidade: 98, unidade: 'UN', ponto: 'encaixotamento' }),
    EV('o2', { op_id: 'OP-2' }),
  ]
  const r = resumoDaOrdem(eventos, 'OP-1')
  assert.equal(r.itens.length, 1)
  assert.equal(r.itens[0].liquido, 6.5)
  assert.equal(r.itens[0].perda_declarada, 0.2)
  assert.deepEqual(r.realizado, { cozinha: 100, encaixotamento: 98 })
})

test('CA-4-02: retificação substitui o original no resumo e o original continua na lista', () => {
  const eventos = [EV('e1'), EV('r1', { quantidade: 5.8, retifica: 'e1', motivo: 'balança' })]
  assert.deepEqual(eventosEficazes(eventos).map((e) => e.evento_id), ['r1'])
  assert.equal(resumoDaOrdem(eventos, 'OP-1').itens[0].liquido, 5.8)
  assert.equal(eventos.length, 2)
  const anulado = [EV('e1'), EV('r1', { quantidade: 0, retifica: 'e1', motivo: 'erro' })]
  assert.equal(resumoDaOrdem(anulado, 'OP-1').itens[0].liquido, 0)
})

test('CA-4-02: unidades diferentes do mesmo item nunca se somam', () => {
  const r = resumoDaOrdem([EV('a'), EV('b', { unidade: 'G', quantidade: 500 })], 'OP-1')
  assert.equal(r.itens.length, 2)
})

test('CA-4-02: o formulário recusa o que a rota recusa', () => {
  assert.equal(validarFormulario(FORM).ok, true)
  assert.equal(validarFormulario({ ...FORM, quantidade: 0 }).ok, false)
  assert.equal(validarFormulario({ ...FORM, item: ' ' }).ok, false)
  assert.equal(validarFormulario({ ...FORM, tipo: 'realizado', quantidade: 0 }).ok, false)
  assert.equal(validarFormulario({ ...FORM, tipo: 'realizado', quantidade: 0, motivo: 'linha parada' }).ok, true)
  assert.equal(validarFormulario({ ...FORM, tipo: 'realizado', quantidade: -1 }).ok, false)
})

test('CA-4-02: falta de acesso e erros não dão pistas', () => {
  assert.equal(mensagemDoApontamento(403, null).texto, mensagemDoApontamento(401, null).texto)
  assert.doesNotMatch(mensagemDoApontamento(403, { erro: 'sem_permissao' }).texto, /área|perfil|ponto|permiss/i)
  assert.match(mensagemDoApontamento(409, { erro: 'ordem_em_envio' }).texto, /em envio/)
})

test('CA-4-05: a tela de Apontamentos não importa *_DEMO, não chama as funções locais e usa só o cliente do servidor', () => {
  const src = readFileSync(new URL('../../src/pages/Apontamentos.tsx', import.meta.url), 'utf8')
  assert.doesNotMatch(src, /_DEMO\b/)
  assert.doesNotMatch(src, /\bregistrarEvento\b|\bretificarEvento\b|\bregistrarConferencia\b|\baprovarConsolidacao\b|\bpublicarProgramacao\b/)
  assert.doesNotMatch(src, /lib\/pcp\/apontamento'/)
  assert.match(src, /services\/pcp-producao/)
  assert.match(src, /registrarApontamentoServidor/)
  assert.match(src, /lerEstadoProducao/)
  assert.match(src, /setInterval\(carregar, 30000\)/)
  assert.match(src, /Não foi possível carregar/)
  assert.match(src, /Tentar de novo/)
})
