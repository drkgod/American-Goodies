// tests/pcp/spec-3-009.test.mjs — SPEC-3-009 CA-3-26 a CA-3-29 (P3.09-01 a 06, em fixture e simulador)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PERFIS_FAT_DE_TESTE } from '../../src/lib/pcp/acoes-faturamento.ts'
import { analisarPedido } from '../../src/lib/pcp/unidades.ts'
import {
  avaliarPedido, contarVolumes, criarPedidoManual, criarSimuladorVenda, decidirDuplicata, definirFrete, conferirGravacao,
  gravarNoOmie, hashDoConteudo, liberarParaFaturar, preparacaoVazia, verificarDuplicata, MODALIDADES_FRETE,
} from '../../src/lib/pcp/preparacao-pedido.ts'

const { faturamento, expedicao, liberador } = PERFIS_FAT_DE_TESTE
const AGORA = new Date('2026-10-28T21:00:00Z')
const unidades = [{ clienteOmie: '555', unidade: 'Unidade Demo', nomeFantasiaOperacional: 'Demo', tipo: 'franquia', ativo: true, versao: 1, alteradoPor: 'f', alteradoEm: '2026-10-01T00:00:00Z' }]
const tabela = [{ chave: '555', item: 'CAIXA-DEMO', preco: 50, unidade: 'CX', vigenciaInicio: '2026-01-01', versao: 1, origem: 'operacional' }]
const pedido = (extra = {}) => ({ pedidoId: 'P1', clienteOmie: '555', data: '2026-10-28', origem: 'omie', itens: [{ item: 'caixa-demo', quantidade: 12, precoPedido: 50 }], subtotalPedido: 600, ...extra })
const analise = analisarPedido(pedido(), unidades, tabela)
const nenhuma = { situacao: 'nenhuma' }

function pronto() {
  let p = preparacaoVazia('P1')
  p = definirFrete({ perfil: faturamento, atual: p, versaoEsperada: 0, modalidade: 'CIF' }).preparacao
  p = contarVolumes({ perfil: expedicao, usuario: 'exp', atual: p, versaoEsperada: 1, quantidade: 12, agora: AGORA }).preparacao
  return p
}
const hash = (p) => hashDoConteudo({ analise, preparacao: p, clienteOmie: '555' })

test('P3.09-01: sem frete e sem volumes → bloqueado com os dois motivos; sem cubagem; sem frete padrão', () => {
  const a = avaliarPedido({ analise, preparacao: preparacaoVazia('P1'), duplicata: nenhuma, hashAtual: '' })
  assert.equal(a.estado, 'bloqueado')
  assert.ok(a.motivos.includes('frete não definido'))
  assert.ok(a.motivos.includes('volumes não conferidos'))
  assert.equal(definirFrete({ perfil: faturamento, atual: preparacaoVazia('P1'), versaoEsperada: 0, modalidade: null }).http, 422)
  assert.equal(definirFrete({ perfil: faturamento, atual: preparacaoVazia('P1'), versaoEsperada: 0, modalidade: 'QUALQUER' }).http, 422)
  assert.equal(MODALIDADES_FRETE.length, 6)
  const v = contarVolumes({ perfil: expedicao, usuario: 'e', atual: preparacaoVazia('P1'), versaoEsperada: 0, quantidade: 0, agora: AGORA })
  assert.equal(v.http, 422)
  const ok = contarVolumes({ perfil: expedicao, usuario: 'e', atual: preparacaoVazia('P1'), versaoEsperada: 0, quantidade: 3, agora: AGORA })
  assert.deepEqual(Object.keys(ok.preparacao.volumes).sort(), ['conferidoEm', 'conferidoPor', 'pesoBruto', 'quantidade'])
})

test('acessos: frete só com preparar_pedido, volumes só com conferir_volumes; versão desatualizada recusa', () => {
  assert.equal(definirFrete({ perfil: expedicao, atual: preparacaoVazia('P1'), versaoEsperada: 0, modalidade: 'CIF' }).http, 403)
  assert.equal(contarVolumes({ perfil: faturamento, usuario: 'f', atual: preparacaoVazia('P1'), versaoEsperada: 0, quantidade: 1, agora: AGORA }).http, 403)
  assert.equal(definirFrete({ perfil: faturamento, atual: preparacaoVazia('P1'), versaoEsperada: 3, modalidade: 'CIF' }).http, 409)
})

test('P3.09-04: CIF e 12 volumes → apto; só liberar_faturamento libera, com autor e hora', () => {
  const p = pronto()
  assert.equal(avaliarPedido({ analise, preparacao: p, duplicata: nenhuma, hashAtual: hash(p) }).estado, 'apto')
  const av = avaliarPedido({ analise, preparacao: p, duplicata: nenhuma, hashAtual: hash(p) })
  const base = { usuario: 'lib', avaliacao: av, preparacao: p, versaoEsperada: p.versao, hashAtual: hash(p), agora: AGORA }
  assert.equal(liberarParaFaturar({ ...base, perfil: faturamento }).http, 403)
  const l = liberarParaFaturar({ ...base, perfil: liberador })
  assert.equal(l.ok, true)
  assert.equal(l.preparacao.liberacao.por, 'lib')
  assert.equal(avaliarPedido({ analise, preparacao: l.preparacao, duplicata: nenhuma, hashAtual: hash(l.preparacao) }).estado, 'liberado')
})

test('liberar pedido bloqueado é recusado com os motivos', () => {
  const p = preparacaoVazia('P1')
  const av = avaliarPedido({ analise, preparacao: p, duplicata: nenhuma, hashAtual: '' })
  const r = liberarParaFaturar({ perfil: liberador, usuario: 'l', avaliacao: av, preparacao: p, versaoEsperada: 0, hashAtual: '', agora: AGORA })
  assert.equal(r.http, 409)
  assert.ok(r.motivos.length >= 2)
})

test('P3.09-06: volumes alterados depois da liberação desfazem a liberação', () => {
  const p = pronto()
  const av = avaliarPedido({ analise, preparacao: p, duplicata: nenhuma, hashAtual: hash(p) })
  const l = liberarParaFaturar({ perfil: liberador, usuario: 'l', avaliacao: av, preparacao: p, versaoEsperada: p.versao, hashAtual: hash(p), agora: AGORA }).preparacao
  const m = contarVolumes({ perfil: expedicao, usuario: 'exp', atual: l, versaoEsperada: l.versao, quantidade: 13, agora: AGORA })
  assert.equal(m.liberacaoDesfeita, true)
  assert.equal(m.preparacao.liberacao, null)
  assert.equal(avaliarPedido({ analise, preparacao: m.preparacao, duplicata: nenhuma, hashAtual: hash(m.preparacao) }).estado, 'apto')
  // mudança no conteúdo sem passar pelo módulo (ex.: item do pedido) também desfaz, pelo hash
  const outra = analisarPedido(pedido({ itens: [{ item: 'caixa-demo', quantidade: 13, precoPedido: 50 }] }), unidades, tabela)
  const h2 = hashDoConteudo({ analise: outra, preparacao: l, clienteOmie: '555' })
  assert.equal(avaliarPedido({ analise: outra, preparacao: l, duplicata: nenhuma, hashAtual: h2 }).estado, 'apto')
})

test('unidade, tabela e origem entram: sem unidade, preço diferente e origem a confirmar bloqueiam', () => {
  const p = pronto()
  const semU = analisarPedido(pedido({ clienteOmie: '999' }), unidades, tabela)
  assert.ok(avaliarPedido({ analise: semU, preparacao: p, duplicata: nenhuma, hashAtual: '' }).motivos.includes('Unidade não cadastrada'))
  const dif = analisarPedido(pedido({ itens: [{ item: 'caixa-demo', quantidade: 12, precoPedido: 45 }] }), unidades, tabela)
  assert.ok(avaliarPedido({ analise: dif, preparacao: p, duplicata: nenhuma, hashAtual: '' }).motivos.some((m) => m.startsWith('preço diferente')))
  const org = analisarPedido(pedido({ origem: 'a_confirmar' }), unidades, tabela)
  assert.ok(avaliarPedido({ analise: org, preparacao: p, duplicata: nenhuma, hashAtual: '' }).motivos.includes('Origem a confirmar'))
})

// ---- pedido manual e duplicata ----
const integrado = { pedidoId: 'P1', clienteOmie: '555', data: '2026-10-28', referencia: 'CANAL-777', itens: [{ item: 'CAIXA-DEMO', quantidade: 12 }] }

test('P3.09-02: manual com a mesma referência de um integrado → duplicata bloqueada', () => {
  const r = criarPedidoManual({ perfil: faturamento, usuario: 'f', pedidoId: 'M1', clienteOmie: '555', data: '2026-10-29', itens: [{ item: 'OUTRO', quantidade: 1 }], motivo: 'veio por e-mail', referencia: 'canal-777', existentes: [integrado], agora: AGORA })
  assert.equal(r.ok, true)
  assert.equal(r.duplicata.situacao, 'duplicata')
  assert.equal(r.pedido.estado, 'bloqueado_duplicata')
  assert.equal(r.pedido.origem, 'manual')
})

test('P3.09-05: manual parecido (cliente, data, itens) sem referência → possível duplicata, a revisar', () => {
  const r = criarPedidoManual({ perfil: faturamento, usuario: 'f', pedidoId: 'M2', clienteOmie: '555', data: '2026-10-28', itens: [{ item: 'caixa-demo', quantidade: 12 }], motivo: 'WhatsApp', existentes: [integrado], agora: AGORA })
  assert.equal(r.duplicata.situacao, 'possivel')
  assert.equal(r.pedido.estado, 'a_revisar')
  const dec = decidirDuplicata({ perfil: faturamento, usuario: 'f', atual: preparacaoVazia('M2'), situacao: r.duplicata, decisao: 'nao_e_duplicata', motivo: 'é outro pedido da mesma loja', agora: AGORA })
  assert.equal(dec.ok, true)
  const sem = decidirDuplicata({ perfil: faturamento, usuario: 'f', atual: preparacaoVazia('M2'), situacao: r.duplicata, decisao: 'nao_e_duplicata', motivo: ' ', agora: AGORA })
  assert.equal(sem.http, 422)
  assert.equal(decidirDuplicata({ perfil: faturamento, usuario: 'f', atual: preparacaoVazia('M1'), situacao: { situacao: 'duplicata', comOutro: 'P1', motivo: 'x' }, decisao: 'nao_e_duplicata', motivo: 'tentativa', agora: AGORA }).http, 422)
})

test('nunca junta por cliente e valor; referências diferentes comprovadas não são duplicata; motivo e acesso obrigatórios', () => {
  const porValor = verificarDuplicata({ pedidoId: 'M3', clienteOmie: '555', data: '2026-10-28', referencia: null, itens: [{ item: 'OUTRO', quantidade: 1 }], valor: 600 }, [integrado])
  assert.equal(porValor.situacao, 'nenhuma')
  const refsDiferentes = verificarDuplicata({ ...integrado, pedidoId: 'M4', referencia: 'CANAL-888' }, [integrado])
  assert.equal(refsDiferentes.situacao, 'nenhuma')
  const base = { usuario: 'f', pedidoId: 'M5', clienteOmie: '555', data: '2026-10-28', itens: [{ item: 'X', quantidade: 1 }], existentes: [], agora: AGORA }
  assert.equal(criarPedidoManual({ ...base, perfil: faturamento, motivo: '' }).http, 422)
  assert.equal(criarPedidoManual({ ...base, perfil: expedicao, motivo: 'e-mail' }).http, 403)
})

// ---- gravação atrás da chave ----
const desligada = { ligada: false, escopo: null }
const ligadaP1 = { ligada: true, escopo: 'P1:volumes_frete' }

test('P3.09-03: chave desligada → 423, zero chamadas, e a tela recebe o que lançar', () => {
  const sim = criarSimuladorVenda('normal')
  const p = pronto()
  const av = avaliarPedido({ analise, preparacao: p, duplicata: nenhuma, hashAtual: hash(p) })
  const lib = liberarParaFaturar({ perfil: liberador, usuario: 'l', avaliacao: av, preparacao: p, versaoEsperada: p.versao, hashAtual: hash(p), agora: AGORA }).preparacao
  const r = gravarNoOmie({ perfil: liberador, operacao: 'volumes_frete', chave: desligada, pedidoId: 'P1', gravacoes: [], analise, preparacao: lib, codigoIntegracao: 'P1', adapter: sim.adapter })
  assert.equal(r.http, 423)
  assert.equal(sim.gravacoes(), 0)
  assert.equal(r.paraLancarAMao.frete.quantidade_volumes, 12)
  assert.equal(r.paraLancarAMao.frete.modalidade, 'CIF')
})

test('volumes e frete do liberado: gravados uma vez no simulador e conferidos; segunda tentativa é 409; chave desliga', () => {
  const sim = criarSimuladorVenda('normal')
  const p = pronto()
  const av = avaliarPedido({ analise, preparacao: p, duplicata: nenhuma, hashAtual: hash(p) })
  const lib = liberarParaFaturar({ perfil: liberador, usuario: 'l', avaliacao: av, preparacao: p, versaoEsperada: p.versao, hashAtual: hash(p), agora: AGORA }).preparacao
  const base = { perfil: liberador, operacao: 'volumes_frete', chave: ligadaP1, pedidoId: 'P1', analise, preparacao: lib, codigoIntegracao: 'P1', adapter: sim.adapter }
  const r = gravarNoOmie({ ...base, gravacoes: [] })
  assert.deepEqual([r.http, r.estado, r.chamadas, r.chaveDepois.ligada], [200, 'confirmada', 1, false])
  assert.equal(conferirGravacao('volumes_frete', { prep: lib }, sim.consultar('P1')).estado, 'gravado_e_conferido')
  const de_novo = gravarNoOmie({ ...base, gravacoes: [{ pedidoId: 'P1', operacao: 'volumes_frete', codigoIntegracao: 'P1', estado: 'confirmada' }] })
  assert.equal(de_novo.http, 409)
  assert.equal(sim.gravacoes(), 1)
  // não liberado não grava; sem a ação não grava
  assert.equal(gravarNoOmie({ ...base, gravacoes: [], preparacao: p }).http, 409)
  assert.equal(gravarNoOmie({ ...base, gravacoes: [], perfil: expedicao }).http, 403)
})

test('resposta perdida: resultado incerto, só consulta confere, nunca regrava; recusa é "falhou sem efeito"', () => {
  const p = pronto()
  const av = avaliarPedido({ analise, preparacao: p, duplicata: nenhuma, hashAtual: hash(p) })
  const lib = liberarParaFaturar({ perfil: liberador, usuario: 'l', avaliacao: av, preparacao: p, versaoEsperada: p.versao, hashAtual: hash(p), agora: AGORA }).preparacao
  const sim = criarSimuladorVenda('corta_resposta')
  const base = { perfil: liberador, operacao: 'volumes_frete', chave: ligadaP1, pedidoId: 'P1', gravacoes: [], analise, preparacao: lib, codigoIntegracao: 'P1', adapter: sim.adapter }
  assert.equal(gravarNoOmie(base).estado, 'resultado_incerto')
  assert.equal(conferirGravacao('volumes_frete', { prep: lib }, sim.consultar('P1')).estado, 'gravado_e_conferido')
  assert.equal(sim.gravacoes(), 1)
  const rec = criarSimuladorVenda('recusa')
  assert.equal(gravarNoOmie({ ...base, adapter: rec.adapter }).estado, 'falhou_sem_efeito')
  assert.equal(conferirGravacao('volumes_frete', { prep: lib }, rec.consultar('P1')).estado, 'resultado_incerto')
})

test('a chave de outro pedido ou de outra operação não vale (escopo)', () => {
  const sim = criarSimuladorVenda('normal')
  const p = pronto()
  const base = { perfil: liberador, operacao: 'volumes_frete', pedidoId: 'P1', gravacoes: [], analise, preparacao: { ...p, liberacao: { hash: 'x', por: 'l', em: 'y' } }, codigoIntegracao: 'P1', adapter: sim.adapter }
  assert.equal(gravarNoOmie({ ...base, chave: { ligada: true, escopo: 'P2:volumes_frete' } }).http, 423)
  assert.equal(gravarNoOmie({ ...base, chave: { ligada: true, escopo: 'P1:incluir_manual' } }).http, 423)
  assert.equal(sim.gravacoes(), 0)
})

test('pedido manual registrado grava uma vez no simulador; duplicata e a revisar nunca montam payload', () => {
  const ok = criarPedidoManual({ perfil: faturamento, usuario: 'f', pedidoId: 'M9', clienteOmie: '555', data: '2026-10-30', itens: [{ item: 'caixa-demo', quantidade: 2 }], motivo: 'e-mail', referencia: 'EMAIL-1', existentes: [integrado], agora: AGORA })
  assert.equal(ok.pedido.estado, 'registrado')
  const anal = analisarPedido({ pedidoId: 'M9', clienteOmie: '555', data: '2026-10-30', origem: 'manual', itens: [{ item: 'caixa-demo', quantidade: 2, precoPedido: null }], subtotalPedido: null }, unidades, tabela)
  const sim = criarSimuladorVenda('normal')
  const g = gravarNoOmie({ perfil: faturamento, operacao: 'incluir_manual', chave: { ligada: true, escopo: 'M9:incluir_manual' }, pedidoId: 'M9', gravacoes: [], manual: ok.pedido, analise: anal, preparacao: preparacaoVazia('M9'), codigoIntegracao: ok.pedido.codigoIntegracao, adapter: sim.adapter })
  assert.equal(g.estado, 'confirmada')
  assert.equal(conferirGravacao('incluir_manual', { itens: 1 }, sim.consultar('MAN-M9')).estado, 'gravado_e_conferido')
  const bloq = criarPedidoManual({ perfil: faturamento, usuario: 'f', pedidoId: 'M8', clienteOmie: '555', data: '2026-10-30', itens: [{ item: 'x', quantidade: 1 }], motivo: 'e-mail', referencia: 'CANAL-777', existentes: [integrado], agora: AGORA })
  const g2 = gravarNoOmie({ perfil: faturamento, operacao: 'incluir_manual', chave: { ligada: true, escopo: 'M8:incluir_manual' }, pedidoId: 'M8', gravacoes: [], manual: bloq.pedido, analise: anal, preparacao: preparacaoVazia('M8'), codigoIntegracao: 'MAN-M8', adapter: sim.adapter })
  assert.equal(g2.http, 422)
  assert.equal(sim.gravacoes(), 1)
})
