// tests/pcp/spec-3-017.test.mjs — SPEC-3-017 CA-3-45, CA-3-46 (P3.17-01 a 04, em fixture)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { configInicial, recalcular, registrarVeredito } from '../../src/lib/pcp/loop-alertas.ts'
import {
  faltaParaLigarLoop2, ligar, ligarLoop2, medirPerguntas, revisar, salvarPrioritaria, temFontePeriodo, vigentes,
} from '../../src/lib/pcp/loop-perguntas.ts'

const AGORA = new Date('2026-11-30T12:00:00Z')
const ini = '2026-11-01T00:00:00Z'
const fim = '2026-11-30T23:59:59Z'
const gestao = { ativo: true, areas: ['planejamento', 'compras', 'faturamento'], acoes: [] }
const compras = { ativo: true, areas: ['compras'], acoes: [] }
const validador = { ativo: true, areas: [], acoes: ['validar_loop'] }
const cfg = { ativo: true, baselinePct: 40, alvoPct: 80, janelaDias: 30, validador: 'valida@exemplo.test' }
const feita = (id, extra = {}) => ({ id, usuario: 'pessoa@exemplo.test', criadaEm: '2026-11-10T10:00:00Z', resultado: 'respondida', fontes: [{ nome: 'alertas do sistema', periodo: 'situação atual' }], ...extra })
const rev = (id, aceita, extra = {}) => ({ perguntaId: id, prioritaria: 'P1', ligadaPor: 'x', aceita, motivo: null, validador: 'valida@exemplo.test', revisadoEm: '2026-11-11T10:00:00Z', ...extra })

test('P3.17-01: ciclo sem pergunta prioritária feita → "não aplicável", nunca 100%', () => {
  const m = medirPerguntas({ cicloInicio: ini, cicloFim: fim, perguntas: [feita('q1')], revisoes: [], fonteCompleta: true, agora: AGORA })
  assert.deepEqual([m.naoAplicavel, m.proporcaoPct, m.gerados], [true, null, 0])
  const fora = medirPerguntas({ cicloInicio: ini, cicloFim: fim, perguntas: [feita('q1', { criadaEm: '2026-10-01T00:00:00Z' })], revisoes: [rev('q1', true)], fonteCompleta: true, agora: AGORA })
  assert.equal(fora.naoAplicavel, true)
  assert.equal(medirPerguntas({ cicloInicio: ini, cicloFim: fim, perguntas: [], revisoes: [], fonteCompleta: false, agora: AGORA }).pendente, true)
})

test('P3.17-02: resposta aceita sem fonte ou sem período não conta', () => {
  const perguntas = [feita('q1'), feita('q2', { fontes: [] }), feita('q3', { fontes: [{ nome: 'x', periodo: '' }] }), feita('q4', { resultado: 'sem_fonte' })]
  const revisoes = perguntas.map((p) => rev(p.id, true))
  const m = medirPerguntas({ cicloInicio: ini, cicloFim: fim, perguntas, revisoes, fonteCompleta: true, agora: AGORA })
  assert.deepEqual([m.gerados, m.tratados, m.proporcaoPct], [4, 1, 25])
  assert.equal(temFontePeriodo(perguntas[1]), false)
})

test('P3.17-03: 5 prioritárias feitas, 4 aceitas → 80%; recusada e ainda sem revisão não contam como aceitas', () => {
  const perguntas = ['a', 'b', 'c', 'd', 'e'].map((id) => feita(id))
  const revisoes = [rev('a', true), rev('b', true), rev('c', true), rev('d', true), rev('e', false, { motivo: 'sem período claro' })]
  const m = medirPerguntas({ cicloInicio: ini, cicloFim: fim, perguntas, revisoes, fonteCompleta: true, agora: AGORA })
  assert.deepEqual([m.gerados, m.tratados, m.proporcaoPct], [5, 4, 80])
  const semRevisao = medirPerguntas({ cicloInicio: ini, cicloFim: fim, perguntas, revisoes: [...revisoes.slice(0, 4), { ...rev('e', null), validador: null, revisadoEm: null }], fonteCompleta: true, agora: AGORA })
  assert.equal(semRevisao.tratados, 4)
  // pergunta feita sem ligação a prioritária não entra
  const solta = medirPerguntas({ cicloInicio: ini, cicloFim: fim, perguntas: [...perguntas, feita('f')], revisoes, fonteCompleta: true, agora: AGORA })
  assert.equal(solta.gerados, 5)
})

test('P3.17-04: ligar o loop sem condições é recusado e o loop continua desligado', () => {
  assert.deepEqual(faltaParaLigarLoop2(configInicial(), 0), ['perguntas prioritárias', 'linha de base', 'alvo', 'janela', 'validador'])
  const r = ligarLoop2({ podeEditar: true, config: configInicial(), prioritariasAtivas: 0 })
  assert.equal(r.ok, false)
  assert.equal(r.faltam.length, 5)
  assert.deepEqual(ligarLoop2({ podeEditar: true, config: { ...cfg, ativo: false }, prioritariasAtivas: 0 }).faltam, ['perguntas prioritárias'])
  assert.equal(ligarLoop2({ podeEditar: false, config: cfg, prioritariasAtivas: 1 }).http, 403)
  const ok = ligarLoop2({ podeEditar: true, config: { ...cfg, ativo: false }, prioritariasAtivas: 2 })
  assert.equal(ok.config.ativo, true)
})

test('perguntas prioritárias: só a gestão cadastra; cada alteração é versão nova; ligação é escolha, não adivinhação', () => {
  assert.equal(salvarPrioritaria({ perfil: compras, usuario: 'c', codigo: 'P1', texto: 'Quantos alertas críticos?', area: 'pcp', existentes: [] }).http, 403)
  assert.equal(salvarPrioritaria({ perfil: gestao, usuario: 'g', codigo: 'P 1!', texto: 'x', area: 'outra', existentes: [] }).motivos.length, 3)
  const a = salvarPrioritaria({ perfil: gestao, usuario: 'g', codigo: 'p1', texto: 'Quantos alertas críticos?', area: 'pcp', existentes: [] })
  const b = salvarPrioritaria({ perfil: gestao, usuario: 'g', codigo: 'P1', texto: 'Quantos alertas críticos abertos?', area: 'pcp', existentes: [a.prioritaria] })
  assert.deepEqual([a.prioritaria.versao, b.prioritaria.versao], [1, 2])
  assert.equal(vigentes([a.prioritaria, b.prioritaria])[0].texto, 'Quantos alertas críticos abertos?')
  const desativada = salvarPrioritaria({ perfil: gestao, usuario: 'g', codigo: 'P1', texto: 'Quantos alertas críticos abertos?', area: 'pcp', ativa: false, existentes: [a.prioritaria, b.prioritaria] })
  const pri = [a.prioritaria, b.prioritaria]
  const q = feita('q1')
  assert.equal(ligar({ perfil: compras, usuario: 'outro@exemplo.test', pergunta: q, codigo: 'P1', prioritarias: pri, revisoes: [] }).http, 403) // não é dona nem validador
  assert.equal(ligar({ perfil: compras, usuario: 'pessoa@exemplo.test', pergunta: q, codigo: 'P1', prioritarias: pri, revisoes: [] }).ok, true) // a própria pessoa
  assert.equal(ligar({ perfil: validador, usuario: 'valida@exemplo.test', pergunta: q, codigo: 'p1', prioritarias: pri, revisoes: [] }).ok, true) // o validador
  assert.equal(ligar({ perfil: validador, usuario: 'valida@exemplo.test', pergunta: q, codigo: 'P9', prioritarias: pri, revisoes: [] }).http, 422)
  assert.equal(ligar({ perfil: validador, usuario: 'valida@exemplo.test', pergunta: q, codigo: 'P1', prioritarias: [...pri, desativada.prioritaria], revisoes: [] }).http, 422) // vigente está inativa
  assert.equal(ligar({ perfil: validador, usuario: 'v', pergunta: q, codigo: 'P1', prioritarias: pri, revisoes: [rev('q1', true)] }).erro, 'ja_revisada')
})

test('revisão do validador: só o indicado; recusa exige motivo; uma revisão por pergunta', () => {
  const ligada = { perguntaId: 'q1', prioritaria: 'P1', ligadaPor: 'x', aceita: null, motivo: null, validador: null, revisadoEm: null }
  const base = { perfilTemAcao: true, usuario: 'valida@exemplo.test', config: cfg, revisao: ligada, aceita: false, agora: AGORA }
  assert.equal(revisar({ ...base, usuario: 'outro@exemplo.test' }).http, 403)
  assert.equal(revisar({ ...base, perfilTemAcao: false }).http, 403)
  assert.equal(revisar({ ...base, revisao: null }).erro, 'sem_ligacao')
  assert.equal(revisar({ ...base, motivo: ' ' }).http, 422) // recusa sem motivo
  const ok = revisar({ ...base, motivo: 'não citou o período' })
  assert.equal(ok.ok, true)
  assert.equal(ok.revisao.aceita, false)
  assert.equal(revisar({ ...base, revisao: ok.revisao, aceita: true }).erro, 'ja_revisada')
  assert.equal(revisar({ ...base, aceita: true }).revisao.motivo, null)
})

test('veredito e congelamento reaproveitados do LOOP-01: ciclo controlado de demonstração', () => {
  const perguntas = ['a', 'b', 'c', 'd', 'e'].map((id) => feita(id))
  const revisoes = [rev('a', true), rev('b', true), rev('c', true), rev('d', true), rev('e', false, { motivo: 'x' })]
  const m = medirPerguntas({ cicloInicio: ini, cicloFim: fim, perguntas, revisoes, fonteCompleta: true, agora: AGORA })
  assert.equal(m.loop, 'LOOP-02')
  const v = registrarVeredito({ perfilTemAcao: true, usuario: 'valida@exemplo.test', config: cfg, medicao: m, veredito: 'atingido', agora: AGORA })
  assert.equal(v.ok, true)
  assert.equal(v.medicao.congelada, true)
  // pergunta nova depois do veredito não muda a medição congelada
  const nova = medirPerguntas({ cicloInicio: ini, cicloFim: fim, perguntas: [...perguntas, feita('f')], revisoes: [...revisoes, rev('f', true)], fonteCompleta: true, agora: AGORA })
  assert.equal(recalcular(v.medicao, nova).proporcaoPct, 80)
  assert.equal(registrarVeredito({ perfilTemAcao: true, usuario: 'valida@exemplo.test', config: { ...cfg, ativo: false }, medicao: m, veredito: 'atingido', agora: AGORA }).erro, 'loop_desligado')
})
