// tests/pcp/spec-3-013.test.mjs — SPEC-3-013 CA-3-37, CA-3-38 (P3.13-01 a 04, em fixture)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { configInicial, definirConfig, faltaParaLigar, medirCiclo, recalcular, registrarVeredito, sugestaoParaValidador } from '../../src/lib/pcp/loop-alertas.ts'

const AGORA = new Date('2026-11-30T12:00:00Z')
const ini = '2026-11-01T00:00:00Z'
const fim = '2026-11-30T23:59:59Z'
const alerta = (extra = {}) => ({ gravidade: 'critico', abertoEm: '2026-11-10T10:00:00Z', estado: 'aberto', acao: null, tratadoEm: null, ...extra })
const tratado = (acao = 'compra_solicitada') => alerta({ estado: 'tratado', acao, tratadoEm: '2026-11-12T10:00:00Z' })

test('P3.13-01: ciclo sem alertas críticos → "não aplicável", nunca 100%', () => {
  const m = medirCiclo({ cicloInicio: ini, cicloFim: fim, alertas: [alerta({ gravidade: 'atencao' }), alerta({ gravidade: 'atencao', estado: 'tratado', acao: 'risco_aceito', tratadoEm: '2026-11-11T00:00:00Z' })], fonteCompleta: true, agora: AGORA })
  assert.equal(m.naoAplicavel, true)
  assert.equal(m.proporcaoPct, null)
  assert.equal(m.gerados, 0)
  assert.equal(medirCiclo({ cicloInicio: ini, cicloFim: fim, alertas: [], fonteCompleta: true, agora: AGORA }).proporcaoPct, null)
})

test('P3.13-02: tratado sem ação registrada não conta como tratado', () => {
  const m = medirCiclo({ cicloInicio: ini, cicloFim: fim, alertas: [tratado(), alerta({ estado: 'tratado', acao: null, tratadoEm: '2026-11-12T10:00:00Z' }), alerta({ estado: 'tratado', acao: 'qualquer', tratadoEm: '2026-11-12T10:00:00Z' })], fonteCompleta: true, agora: AGORA })
  assert.equal(m.gerados, 3)
  assert.equal(m.tratados, 1)
  assert.equal(m.proporcaoPct, 33.33)
})

test('P3.13-03: 10 críticos gerados, 7 tratados com ação → 70%', () => {
  const alertas = [...Array(7)].map(() => tratado()).concat([...Array(3)].map(() => alerta()))
  const m = medirCiclo({ cicloInicio: ini, cicloFim: fim, alertas, fonteCompleta: true, agora: AGORA })
  assert.deepEqual([m.gerados, m.tratados, m.proporcaoPct, m.naoAplicavel], [10, 7, 70, false])
})

test('só entram críticos gerados dentro do ciclo; tratado depois do fim do ciclo não conta nele', () => {
  const fora = alerta({ abertoEm: '2026-10-20T10:00:00Z' })
  const tarde = alerta({ estado: 'tratado', acao: 'risco_aceito', tratadoEm: '2026-12-02T10:00:00Z' })
  const m = medirCiclo({ cicloInicio: ini, cicloFim: fim, alertas: [fora, tarde, tratado()], fonteCompleta: true, agora: AGORA })
  assert.deepEqual([m.gerados, m.tratados], [2, 1])
})

test('fonte incompleta: medição pendente, sem proporção e sem "não aplicável"', () => {
  const m = medirCiclo({ cicloInicio: ini, cicloFim: fim, alertas: [tratado()], fonteCompleta: false, agora: AGORA })
  assert.deepEqual([m.pendente, m.proporcaoPct, m.naoAplicavel], [true, null, false])
  assert.ok(m.motivoPendente)
})

test('P3.13-04: ativar sem linha de base, alvo, janela e validador → recusado e o loop continua desligado', () => {
  assert.equal(configInicial().ativo, false)
  assert.deepEqual(faltaParaLigar(configInicial()), ['linha de base', 'alvo', 'janela', 'validador'])
  const r = definirConfig({ podeEditar: true, atual: configInicial(), novo: { ligar: true } })
  assert.equal(r.ok, false)
  assert.equal(r.http, 422)
  assert.equal(r.faltam.length, 4)
  const parcial = definirConfig({ podeEditar: true, atual: configInicial(), novo: { baselinePct: 40, alvoPct: 70, ligar: true } })
  assert.deepEqual(parcial.faltam, ['janela', 'validador'])
  const salva = definirConfig({ podeEditar: true, atual: configInicial(), novo: { baselinePct: 40, alvoPct: 70 } })
  assert.equal(salva.ok, true)
  assert.equal(salva.config.ativo, false)
  assert.equal(definirConfig({ podeEditar: false, atual: configInicial(), novo: { ligar: true } }).http, 403)
  const completa = definirConfig({ podeEditar: true, atual: salva.config, novo: { janelaDias: 30, validador: 'valida@exemplo.test', ligar: true } })
  assert.equal(completa.config.ativo, true)
  // apagar uma condição desliga de novo
  const sem = definirConfig({ podeEditar: true, atual: completa.config, novo: { validador: null } })
  assert.equal(sem.config.ativo, false)
  assert.equal(definirConfig({ podeEditar: true, atual: configInicial(), novo: { alvoPct: 120, baselinePct: 10, janelaDias: 30, validador: 'v', ligar: true } }).http, 422)
})

test('veredito: só o validador indicado com a ação; só com loop ligado e medição aplicável; congela a medição', () => {
  const cfg = { ativo: true, baselinePct: 40, alvoPct: 70, janelaDias: 30, validador: 'valida@exemplo.test' }
  const m = medirCiclo({ cicloInicio: ini, cicloFim: fim, alertas: [tratado(), alerta()], fonteCompleta: true, agora: AGORA })
  const base = { perfilTemAcao: true, usuario: 'valida@exemplo.test', config: cfg, medicao: m, veredito: 'nao_atingido', agora: AGORA }
  assert.equal(registrarVeredito({ ...base, usuario: 'outro@exemplo.test' }).http, 403)
  assert.equal(registrarVeredito({ ...base, perfilTemAcao: false }).http, 403)
  assert.equal(registrarVeredito({ ...base, config: { ...cfg, ativo: false } }).erro, 'loop_desligado')
  assert.equal(registrarVeredito({ ...base, veredito: 'talvez' }).http, 422)
  const pend = medirCiclo({ cicloInicio: ini, cicloFim: fim, alertas: [], fonteCompleta: false, agora: AGORA })
  assert.equal(registrarVeredito({ ...base, medicao: pend }).erro, 'medicao_pendente')
  const na = medirCiclo({ cicloInicio: ini, cicloFim: fim, alertas: [], fonteCompleta: true, agora: AGORA })
  assert.equal(registrarVeredito({ ...base, medicao: na }).erro, 'nao_aplicavel')
  const ok = registrarVeredito({ ...base, texto: 'faltou gente na semana 2' })
  assert.equal(ok.ok, true)
  assert.equal(ok.medicao.congelada, true)
  assert.equal(ok.medicao.vereditoPor, 'valida@exemplo.test')
  // recalcular depois do veredito não muda a medição congelada
  const nova = medirCiclo({ cicloInicio: ini, cicloFim: fim, alertas: [tratado(), tratado()], fonteCompleta: true, agora: AGORA })
  assert.equal(recalcular(ok.medicao, nova).proporcaoPct, 50)
  assert.equal(recalcular(m, nova).proporcaoPct, 100)
  assert.equal(registrarVeredito({ ...base, medicao: ok.medicao }).erro, 'ja_congelada')
})

test('o loop não trata nem compra: a sugestão ao validador é só texto', () => {
  const m = medirCiclo({ cicloInicio: ini, cicloFim: fim, alertas: [tratado(), alerta()], fonteCompleta: true, agora: AGORA })
  assert.equal(sugestaoParaValidador(m, 70), 'proporção abaixo do alvo')
  assert.equal(sugestaoParaValidador(m, 50), 'proporção igual ou acima do alvo')
  assert.equal(sugestaoParaValidador(m, null), 'alvo ainda não definido')
  for (const proibido of ['acao', 'comprar', 'tratar', 'reprogramar']) assert.equal(proibido in m, false)
})
