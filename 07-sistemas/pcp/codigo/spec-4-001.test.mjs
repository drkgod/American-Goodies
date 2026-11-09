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

// ---- CA-4-03 · CA-4-04 · CA-4-05: conferências, aprovação e consolidações pelo servidor ----
import {
  podeConferir, podeAprovar, mensagemDaConferencia, mensagemDaAprovacao, filaDaOrdem, aprovacaoAtiva, linhasConsolidacao, novoId,
} from '../../src/lib/pcp/conferencia-servidor.ts'
import { decidirAprovacao as decidirAprovacaoServidor } from '../../src/lib/pcp/producao-servidor.ts'

const OPS = { programacao: { ops: [{ op_id: 'OP-1', versao_op: 1, produto: 'M011001' }, { op_id: 'OP-2', versao_op: 1, produto: 'M011002' }] } }
const evR = (id, ponto, q) => ({ evento_id: id, op_id: 'OP-1', ponto, tipo: 'realizado', item: 'M011001', quantidade: q, unidade: 'UN', motivo: null, retifica: null, autor: 'u' })
const cf = (id, etapa, q, op = 'OP-1') => ({ registro_id: id, op_id: op, etapa, quantidade: q, unidade: 'UN', autor: 'u' })
const ESTADO = (o = {}) => ({ ...OPS, eventos: [evR('a', 'cozinha', 100), evR('b', 'encaixotamento', 100)], conferencias: [], aprovacoes: [], ordens: [], ...o })

const PERFIL_EXP = { areas: ['conferir_expedicao'], acoes: ['conferir_expedicao'], pontos: ['expedicao'] }
const PERFIL_PCP = { areas: ['painel', 'conferir_expedicao'], acoes: ['aprovar_consolidacao'], pontos: [] }

test('CA-4-04: quem tem só conferir_expedicao confere a expedição e não a câmara nem aprova', () => {
  assert.equal(podeConferir(PERFIL_EXP, 'recebimento_expedicao'), true)
  assert.equal(podeConferir(PERFIL_EXP, 'entrada_camara'), false)
  assert.equal(podeAprovar(PERFIL_EXP), false)
})

test('CA-4-04: sem a área, a ação ou o ponto, a tela nega a conferência e a aprovação', () => {
  assert.equal(podeConferir({ ...PERFIL_EXP, areas: [] }, 'recebimento_expedicao'), false)
  assert.equal(podeConferir({ ...PERFIL_EXP, pontos: [] }, 'recebimento_expedicao'), false)
  assert.equal(podeConferir({ ...PERFIL_EXP, acoes: [] }, 'recebimento_expedicao'), false)
  assert.equal(podeConferir(null, 'recebimento_expedicao'), false)
  assert.equal(podeAprovar({ areas: ['painel'], acoes: [] }), false)
  assert.equal(podeAprovar({ areas: [], acoes: ['aprovar_consolidacao'] }), false)
  assert.equal(podeAprovar(PERFIL_PCP), true)
  assert.equal(podeConferir(PERFIL_PCP, 'recebimento_expedicao'), false)
})

test('CA-4-03: a fila usa os apontamentos do servidor e as conferências; sem as duas, fica bloqueada e nada vira 0', () => {
  const vazia = filaDaOrdem(ESTADO(), 'OP-1')
  assert.equal(vazia.estado, 'bloqueada')
  assert.equal(vazia.quantidades.recebido_expedicao, null)
  assert.equal(vazia.quantidades.entrada_camara, null)
  assert.equal(vazia.quantidades.produzido, 100)
  assert.equal(vazia.quantidades.encaixotado, 100)
  const ok = filaDaOrdem(ESTADO({ conferencias: [cf('c1', 'recebimento_expedicao', 100), cf('c2', 'entrada_camara', 100)] }), 'OP-1')
  assert.equal(ok.estado, 'revisavel')
  const div = filaDaOrdem(ESTADO({ conferencias: [cf('c1', 'recebimento_expedicao', 98), cf('c2', 'entrada_camara', 98)] }), 'OP-1')
  assert.equal(div.estado, 'bloqueada')
  assert.equal(filaDaOrdem(ESTADO(), 'OP-X'), null)
})

test('CA-4-03: a última conferência de cada etapa é a vigente', () => {
  const f = filaDaOrdem(ESTADO({ conferencias: [cf('c1', 'recebimento_expedicao', 90), cf('c2', 'recebimento_expedicao', 100), cf('c3', 'entrada_camara', 100)] }), 'OP-1')
  assert.equal(f.quantidades.recebido_expedicao, 100)
  assert.equal(f.estado, 'revisavel')
})

test('CA-4-03: a aprovação sem as conferências é recusada com o motivo; a rota prepara a ordem sem enviar', () => {
  const sem = decidirAprovacaoServidor({ aprovacao_id: 'AP-1', op_id: 'OP-1', quantidade_final: 100, motivo: 'ok', data_conclusao: '2026-11-10', expedicao: null, camara: 100 })
  assert.equal(sem.ok, false)
  assert.match(mensagemDaAprovacao(422, { erro: 'conferencia_ausente' }).texto, /Faltam as conferências/)
  const com = decidirAprovacaoServidor({ aprovacao_id: 'AP-1', op_id: 'OP-1', quantidade_final: 100, motivo: 'ok', data_conclusao: '2026-11-10', expedicao: 100, camara: 100 })
  assert.equal(com.ok, true)
  assert.equal(com.ordem.operacao, 'concluir_op')
  const m = mensagemDaAprovacao(200, { ok: true, ordem: { transacao_id: 'TX-AP-1', estado: 'preparada' }, pendencias: [] })
  assert.equal(m.ok, true)
  assert.match(m.texto, /preparada; nada foi enviado ao Omie/)
  const zero = mensagemDaAprovacao(200, { ok: true, ordem: null, pendencias: ['quantidade_final_zero: nenhuma ordem preparada'] })
  assert.match(zero.texto, /Nenhuma ordem foi preparada/)
})

test('CA-4-03: reenvio da mesma conferência ou aprovação mostra "já registrada" e mantém o identificador só em falha de rede', () => {
  assert.match(mensagemDaConferencia(200, { estado: 'replay' }).texto, /já estava registrada/)
  assert.match(mensagemDaAprovacao(200, { estado: 'replay' }).texto, /já estava registrada/)
  assert.equal(mensagemDaConferencia(0, null).manterId, true)
  assert.equal(mensagemDaAprovacao(500, null).manterId, true)
  assert.equal(mensagemDaConferencia(422, { erro: 'quantidade_invalida' }).manterId, false)
  assert.notEqual(novoId('CF'), novoId('CF'))
  assert.match(novoId('AP'), /^AP-/)
})

test('CA-4-03: falta de acesso não dá pistas e conflitos de envio são explicados', () => {
  assert.equal(mensagemDaConferencia(403, null).texto, mensagemDaAprovacao(401, null).texto)
  assert.doesNotMatch(mensagemDaConferencia(403, { erro: 'sem_permissao' }).texto, /área|perfil|ponto|permiss/i)
  assert.match(mensagemDaConferencia(409, { erro: 'ordem_em_envio' }).texto, /em envio/)
  assert.match(mensagemDaAprovacao(409, { erro: 'ordem_ja_enviada' }).texto, /já foi enviada/)
})

test('CA-4-03: /consolidacoes lista a ordem, as conferências, a aprovação e o estado da ordem, sem envio', () => {
  const est = ESTADO({
    conferencias: [cf('c1', 'recebimento_expedicao', 100), cf('c2', 'entrada_camara', 100)],
    aprovacoes: [{ aprovacao_id: 'AP-1', op_id: 'OP-1', quantidade_final: 100, motivo: 'ok', estado: 'ativa', aprovador: 'pcp' }],
    ordens: [{ transacao_id: 'TX-AP-1', op_id: 'OP-1', estado: 'preparada', quantidade: 100 }],
  })
  const l = linhasConsolidacao(est)
  assert.equal(l.length, 2)
  assert.equal(l[0].situacao, 'Ordem preparada')
  assert.equal(l[0].ordem.estado, 'preparada')
  assert.equal(l[0].expedicao, 100)
  assert.equal(l[1].situacao, 'Sem conferência')
  assert.equal(aprovacaoAtiva(est, 'OP-1').aprovacao_id, 'AP-1')
  assert.equal(aprovacaoAtiva(est, 'OP-2'), null)
  const incompleta = linhasConsolidacao(ESTADO({ conferencias: [cf('c1', 'recebimento_expedicao', 100)] }))
  assert.equal(incompleta[0].situacao, 'Conferência incompleta')
  const pronta = linhasConsolidacao(ESTADO({ conferencias: [cf('c1', 'recebimento_expedicao', 100), cf('c2', 'entrada_camara', 100)] }))
  assert.equal(pronta[0].situacao, 'Aguardando aprovação do PCP')
})

test('CA-4-05: Conferências e Consolidações não importam *_DEMO, não chamam as funções locais e leem/gravam só pelo servidor', () => {
  for (const nome of ['Conferencias', 'Consolidacoes']) {
    const src = readFileSync(new URL(`../../src/pages/${nome}.tsx`, import.meta.url), 'utf8')
    assert.doesNotMatch(src, /_DEMO\b/, nome)
    assert.doesNotMatch(src, /\bregistrarEvento\b|(?<![A-Za-z])registrarConferencia\(|(?<![A-Za-z])aprovarConsolidacao\(|\bpublicarProgramacao\b|invalidarPorNovaProjecao|retificarAntesDaAquisicao/, nome)
    assert.doesNotMatch(src, /lib\/pcp\/(conferencia|revisao-consolidacao|fila-omie|contrato-op)'/, nome)
    assert.match(src, /services\/pcp-producao/, nome)
    assert.match(src, /lerEstadoProducao/, nome)
    assert.match(src, /setInterval\(carregar, 30000\)/, nome)
    assert.match(src, /Não foi possível carregar/, nome)
  }
  const conf = readFileSync(new URL('../../src/pages/Conferencias.tsx', import.meta.url), 'utf8')
  assert.match(conf, /registrarConferenciaServidor/)
  assert.match(conf, /aprovarConsolidacaoServidor/)
  assert.doesNotMatch(conf, /Simular nova conferência|Tela de demonstração/)
})

test('CA-4-05: /consolidacoes não tem botão de envio nem a fila de simulação', () => {
  const src = readFileSync(new URL('../../src/pages/Consolidacoes.tsx', import.meta.url), 'utf8')
  assert.doesNotMatch(src, /Fila de envio ao Omie \(simulação\)|enviarComAquisicao|prepararTransacao|reconciliarPorConsulta/)
  assert.doesNotMatch(src, /<Button[^>]*>\s*(Enviar|Autorizar)/)
})

test('CA-4-05: a troca fixa da área da conferência não existe mais; a rota e o menu aceitam conferir_expedicao ou painel', () => {
  const app = readFileSync(new URL('../../src/App.tsx', import.meta.url), 'utf8')
  const lay = readFileSync(new URL('../../src/components/Layout.tsx', import.meta.url), 'utf8')
  const prot = readFileSync(new URL('../../src/components/ProtectedArea.tsx', import.meta.url), 'utf8')
  assert.doesNotMatch(app, /DEMO_CONFERENCIA/)
  assert.doesNotMatch(lay, /DEMO_CONFERENCIA|ITENS_DEMO/)
  assert.match(app, /area="conferir_expedicao\|painel"/)
  assert.match(lay, /area: 'conferir_expedicao\|painel'/)
  assert.match(prot, /area\.split\('\|'\)/)
})

// ---- CA-4-33: produção gravada no servidor nos relatórios, nos alertas e na exportação ----
import {
  programacaoReal, ordensDoRelatorio, entradasProducaoAtrasada, lacunasDaProducao,
} from '../../src/lib/pcp/producao-fontes.ts'
import { relatorioProducao } from '../../src/lib/pcp/relatorios.ts'
import { regraProducao } from '../../src/lib/pcp/alertas.ts'
import { COLECOES_COMPLEMENTARES, montarPacote, conferirRestauracao, resumoParaCsv } from '../../src/lib/pcp/exportacao.ts'

const PROG = { ops: [
  { op_id: 'OP-1', produto: 'M011001', quantidade: 100, data: '2026-11-10' },
  { op_id: 'OP-2', produto: 'M011001', quantidade: 50, data: '2026-11-11' },
  { op_id: 'OP-3', produto: 'COOKIE-1', quantidade: 70, data: '2026-11-10' },
] }
const E = (id, op, ponto, q, extra = {}) => ({ evento_id: id, op_id: op, ponto, tipo: 'realizado', quantidade: q, unidade: 'UN', retifica: null, ...extra })
const C = (op, etapa, q, extra = {}) => ({ op_id: op, etapa, quantidade: q, unidade: 'UN', ...extra })
const PERIODO = { de: '2026-11-01', ate: '2026-11-30' }

test('CA-4-33: o relatório de produção usa a programação e os apontamentos do servidor (planejado × produzido × conferido)', () => {
  const ent = ordensDoRelatorio(PROG, [E('a', 'OP-1', 'cozinha', 40), E('b', 'OP-1', 'cozinha', 58), E('c', 'OP-1', 'encaixotamento', 96)], [C('OP-1', 'recebimento_expedicao', 97), C('OP-1', 'entrada_camara', 96)], PERIODO)
  const linhas = relatorioProducao(ent.ordens.filter((o) => o.op === 'OP-1'))
  assert.equal(linhas.length, 1)
  assert.deepEqual([linhas[0].planejado, linhas[0].produzido, linhas[0].conferido], [100, 98, 96])
})

test('CA-4-33: sem apontamento ou sem conferência a coluna fica sem dado, nunca zero', () => {
  const ent = ordensDoRelatorio(PROG, [], [], PERIODO)
  assert.equal(ent.ordens.length, 2) // OP-3 é produto de demonstração
  const linhas = relatorioProducao(ent.ordens)
  assert.equal(linhas[0].planejado, 150)
  assert.equal(linhas[0].produzido, null)
  assert.equal(linhas[0].conferido, null)
  assert.equal(ent.semApontamento, 2)
  assert.match(lacunasDaProducao(ent).join(' '), /2 ordem\(ns\) sem apontamento/)
})

test('CA-4-33: realizado retificado não conta duas vezes e 0 declarado é um dado, não ausência', () => {
  const ent = ordensDoRelatorio(PROG, [E('a', 'OP-1', 'cozinha', 40), E('b', 'OP-1', 'cozinha', 55, { retifica: 'a' }), E('z', 'OP-2', 'cozinha', 0)], [], PERIODO)
  const [o1, o2] = ent.ordens
  assert.equal(o1.produzido, 55)
  assert.equal(o2.produzido, 0)
})

test('CA-4-33: período e produto filtram as ordens; a última conferência de câmara vale', () => {
  const so = ordensDoRelatorio(PROG, [], [C('OP-1', 'entrada_camara', 90), C('OP-1', 'entrada_camara', 96)], { de: '2026-11-10', ate: '2026-11-10' })
  assert.deepEqual(so.ordens.map((o) => o.op), ['OP-1'])
  assert.equal(so.ordens[0].conferido, 96)
  assert.equal(ordensDoRelatorio(PROG, [], [], PERIODO, 'm011001').ordens.length, 2)
  assert.equal(ordensDoRelatorio(PROG, [], [], PERIODO, 'OUTRO').ordens.length, 0)
})

test('CA-4-33: registro de demonstração não entra no relatório', () => {
  const ent = ordensDoRelatorio(PROG, [E('a', 'OP-1', 'cozinha', 100, { demonstracao: true }), E('b', 'OP-1', 'cozinha', 30)], [C('OP-1', 'entrada_camara', 5, { demonstracao: true })], PERIODO)
  assert.equal(ent.ordens[0].produzido, 30)
  assert.equal(ent.ordens[0].conferido, null)
  // programação de demonstração: a real anterior continua valendo
  assert.equal(programacaoReal([{ ops: PROG.ops.slice(0, 1) }, { ops: PROG.ops, demonstracao: true }]).ops.length, 1)
  assert.equal(programacaoReal([{ ops: [], demonstracao: true }]), null)
  assert.equal(ordensDoRelatorio(null, [], [], PERIODO).ordens.length, 0)
})

const PARAMS = { versao: 3, aprovador: 'pcp', aprovadoEm: '2026-11-01T10:00:00Z', itens: [], gravidade: { producao: 'atencao' } }
const HOJE = new Date('2026-11-11T00:00:00Z')
const AGORA = new Date('2026-11-11T12:00:00Z')

test('CA-4-33: a regra de produção atrasada usa as programações e os apontamentos do servidor', () => {
  const ent = entradasProducaoAtrasada(PROG, [E('a', 'OP-2', 'cozinha', 10)])
  assert.deepEqual(ent.map((x) => x.ordem), ['OP-1', 'OP-2'])
  const r1 = regraProducao(PARAMS, { ...ent[0], dadoEm: AGORA }, HOJE, AGORA)
  assert.equal(r1.alerta.tipo, 'producao')
  assert.equal(r1.alerta.valores.diasDeAtraso, 1)
  assert.ok('nenhum' in regraProducao(PARAMS, { ...ent[1], dadoEm: AGORA }, HOJE, AGORA)) // iniciada
  const futura = entradasProducaoAtrasada({ ops: [{ op_id: 'OP-9', produto: 'M1', quantidade: 1, data: '2026-11-11' }] }, [])
  assert.ok('nenhum' in regraProducao(PARAMS, { ...futura[0], dadoEm: AGORA }, HOJE, AGORA)) // dia programado = hoje
})

test('CA-4-33: apontamento de demonstração não "inicia" a ordem real e ordem de demonstração não gera alerta', () => {
  const ent = entradasProducaoAtrasada(PROG, [E('a', 'OP-1', 'cozinha', 10, { demonstracao: true })])
  assert.equal(ent.find((x) => x.ordem === 'OP-1').iniciada, false)
  assert.equal(ent.some((x) => x.ordem === 'OP-3'), false)
  assert.equal(entradasProducaoAtrasada(null, []).length, 0)
})

test('CA-4-33: a exportação e a recuperação incluem as coleções da 0046 e as contagens batem', () => {
  for (const n of ['pcp_programacoes', 'pcp_apontamentos', 'pcp_conferencias_op', 'pcp_aprovacoes_consolidacao'])
    assert.ok(COLECOES_COMPLEMENTARES.includes(n), n)
  const colecoes = {}
  for (const n of COLECOES_COMPLEMENTARES) colecoes[n] = { campos: ['id', 'nome'], registros: [] }
  colecoes.pcp_apontamentos = { campos: ['evento_id', 'quantidade'], registros: [['e1', 10], ['e2', 20], ['e3', 30]] }
  const p = montarPacote({ colecoes, contagemLeituras: {}, segredos: [], versaoSistema: 'v0.0.206', agora: new Date('2026-11-09T12:00:00Z') })
  const l = p.resumo.linhas.find((x) => x.colecao === 'pcp_apontamentos')
  assert.deepEqual([l.registros, l.exportada], [3, true])
  assert.equal(p.csv.pcp_apontamentos.split('\r\n').length - 1, 3)
  assert.ok(p.csv.pcp_programacoes !== undefined)
  assert.equal(p.resumo.completo, true)
  const csvResumo = resumoParaCsv(p.resumo)
  assert.match(csvResumo, /pcp_conferencias_op/)
  const contagens = Object.fromEntries(p.resumo.linhas.map((x) => [x.colecao, x.registros]))
  assert.equal(conferirRestauracao(p.resumo, contagens).ok, true)
  assert.equal(conferirRestauracao(p.resumo, { ...contagens, pcp_apontamentos: 2 }).ok, false)
  const semAs4 = { ...contagens }
  delete semAs4.pcp_programacoes
  assert.equal(conferirRestauracao(p.resumo, semAs4).ok, false)
})

test('CA-4-33: registro marcado como demonstração fica fora do pacote e a contagem é só a dos reais', () => {
  const colecoes = {}
  for (const n of COLECOES_COMPLEMENTARES) colecoes[n] = { campos: ['id'], registros: [] }
  colecoes.pcp_apontamentos = { campos: ['evento_id', 'quantidade', 'demonstracao'], registros: [['e1', 10, false], ['e2', 20, true], ['e3', 30, false]] }
  colecoes.pcp_conferencias_op = { campos: ['registro_id', 'demonstracao'], registros: [['c1', true]] }
  const p = montarPacote({ colecoes, contagemLeituras: {}, segredos: [], versaoSistema: 'v', agora: new Date('2026-11-09T12:00:00Z') })
  const a = p.resumo.linhas.find((x) => x.colecao === 'pcp_apontamentos')
  assert.equal(a.registros, 2)
  assert.equal(a.demonstracao_fora, 1)
  assert.doesNotMatch(p.csv.pcp_apontamentos, /e2/)
  const c = p.resumo.linhas.find((x) => x.colecao === 'pcp_conferencias_op')
  assert.equal(c.registros, 0)
  assert.equal(c.demonstracao_fora, 1)
})
