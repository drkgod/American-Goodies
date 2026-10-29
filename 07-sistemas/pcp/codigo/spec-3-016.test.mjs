// tests/pcp/spec-3-016.test.mjs — SPEC-3-016 CA-3-43, CA-3-44 (P3.16-01 a 05, em fixture)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  COLECOES_COMPLEMENTARES, autorizarExportacao, campoSensivel, conferirRestauracao, destinoPermitido, montarPacote, resumoParaCsv, varrerSegredos,
} from '../../src/lib/pcp/exportacao.ts'
import { escolherCatalogoAtivo, executarSubLote, loteCompleto, novoSync } from '../../src/lib/pcp/catalogo-sync.ts'

const AGORA = new Date('2026-10-29T20:00:00Z')
const SEGREDOS = ['k3y-super-secreta-OMIE-123', 'sEgReDo-nuvem-987654']

function demo(extra = {}) {
  const colecoes = {}
  for (const n of COLECOES_COMPLEMENTARES) colecoes[n] = { campos: ['id', 'nome'], registros: [] }
  colecoes.pcp_unidades = { campos: ['id', 'cliente_omie', 'unidade'], registros: [['u1', '555', 'Loja A'], ['u2', '556', 'Loja B']] }
  colecoes.pcp_alertas = { campos: ['id', 'tipo'], registros: [['a1', 'estoque']] }
  return montarPacote({ colecoes: { ...colecoes, ...extra }, contagemLeituras: { pcp_dados: 5393, pcp_lotes: 4 }, segredos: SEGREDOS, versaoSistema: 'v0.0.192', agora: AGORA })
}

test('P3.16-01: exportar sem a ação exportar_dados → 403 sem pistas (perfil ausente, inativo ou sem a ação)', () => {
  const nega = { ok: false, http: 403, erro: 'sem_permissao' }
  assert.deepEqual(autorizarExportacao({ ativo: true, acoes: ['consultar_compras'] }), nega)
  assert.deepEqual(autorizarExportacao(null), nega)
  assert.deepEqual(autorizarExportacao({ ativo: false, acoes: ['exportar_dados'] }), nega)
  assert.deepEqual(autorizarExportacao({ ativo: true, acoes: ['exportar_dados'] }), { ok: true })
})

test('P3.16-02: varredura do pacote — nada de segredo, senha ou chave; coluna sensível sai e valor de segredo retira a coleção', () => {
  const pacote = demo()
  const tudo = Object.values(pacote.csv).join('\n') + resumoParaCsv(pacote.resumo)
  assert.deepEqual(varrerSegredos(tudo, SEGREDOS), [])
  // coluna sensível não vai para o CSV
  const comSenha = demo({ pcp_unidades: { campos: ['id', 'unidade', 'passwordHash', 'tokenKey'], registros: [['u1', 'Loja A', 'hash-xyz', 'tok-abc']] } })
  assert.equal(comSenha.csv.pcp_unidades.includes('hash-xyz'), false)
  assert.equal(comSenha.csv.pcp_unidades.includes('passwordHash'), false)
  assert.ok(campoSensivel('app_secret') && campoSensivel('password') && !campoSensivel('cliente_omie'))
  // valor de segredo conhecido escondido num campo livre: a coleção é retirada e o pacote fica incompleto
  const vazado = demo({ pcp_alertas: { campos: ['id', 'regra'], registros: [['a1', 'usei ' + SEGREDOS[0] + ' ontem']] } })
  assert.equal('pcp_alertas' in vazado.csv, false)
  const l = vazado.resumo.linhas.find((x) => x.colecao === 'pcp_alertas')
  assert.equal(l.exportada, false)
  assert.ok(l.motivo.startsWith('retirada do pacote'))
  assert.equal(JSON.stringify(vazado.resumo).includes(SEGREDOS[0]), false) // nem o resumo repete o segredo
  assert.equal(vazado.resumo.completo, false)
  // padrões de credencial
  assert.ok(varrerSegredos('app_secret=abc', []).length > 0)
  assert.ok(varrerSegredos('Authorization: Bearer abcdefghijklmnopqrstuvwxyz', []).length > 0)
})

test('P3.16-03: pacote com resumo — contagens iguais às do sistema; coleção vazia aparece com zero; identificação e versão', () => {
  const p = demo()
  assert.equal(p.resumo.completo, true)
  assert.equal(p.resumo.identificacao, 'Dados da American Goodies (propriedade do cliente)')
  assert.equal(p.resumo.versaoSistema, 'v0.0.192')
  assert.equal(p.resumo.linhas.find((l) => l.colecao === 'pcp_unidades').registros, 2)
  const vazia = p.resumo.linhas.find((l) => l.colecao === 'pcp_volumes')
  assert.deepEqual([vazia.registros, vazia.exportada], [0, true])
  assert.equal(p.csv.pcp_unidades.split('\r\n').length - 1, 2) // cabeçalho + 2 linhas
  // cópias das leituras só como contagem
  const dados = p.resumo.linhas.find((l) => l.colecao === 'pcp_dados')
  assert.deepEqual([dados.registros, dados.exportada], [5393, false])
  assert.equal('pcp_dados' in p.csv, false)
  const csv = resumoParaCsv(p.resumo)
  assert.ok(csv.startsWith('coleção;registros;exportada'))
  assert.ok(csv.includes('pcp_unidades;2;sim'))
})

test('coleção que falha na leitura ou não existe: pacote incompleto com o motivo', () => {
  const colecoes = {}
  for (const n of COLECOES_COMPLEMENTARES) colecoes[n] = { campos: ['id'], registros: [] }
  delete colecoes.pcp_volumes
  const p = montarPacote({ colecoes, falhas: { pcp_alertas: 'tempo esgotado' }, contagemLeituras: {}, segredos: [], versaoSistema: 'v1', agora: AGORA })
  assert.equal(p.resumo.completo, false)
  assert.equal(p.resumo.linhas.find((l) => l.colecao === 'pcp_volumes').motivo, 'coleção não encontrada')
  assert.ok(p.resumo.linhas.find((l) => l.colecao === 'pcp_alertas').motivo.includes('tempo esgotado'))
})

test('P3.16-04 (lógica): restauração com as mesmas contagens passa; coleção faltando ou diferente reprova apontando-a', () => {
  const p = demo()
  const igual = Object.fromEntries(p.resumo.linhas.filter((l) => l.exportada).map((l) => [l.colecao, l.registros]))
  assert.deepEqual(conferirRestauracao(p.resumo, igual), { ok: true, diferencas: [] })
  const faltando = { ...igual }
  delete faltando.pcp_unidades
  const r = conferirRestauracao(p.resumo, faltando)
  assert.equal(r.ok, false)
  assert.deepEqual(r.diferencas, [{ colecao: 'pcp_unidades', origem: 2, restaurado: null }])
  const menos = conferirRestauracao(p.resumo, { ...igual, pcp_alertas: 0 })
  assert.deepEqual(menos.diferencas, [{ colecao: 'pcp_alertas', origem: 1, restaurado: 0 }])
})

test('RN-04: restauração nunca por cima da produção (destino igual à origem é recusado)', () => {
  assert.equal(destinoPermitido('https://prod.goskip.app', 'https://prod.goskip.app/'), false)
  assert.equal(destinoPermitido('https://prod.goskip.app', 'HTTPS://PROD.goskip.app'), false)
  assert.equal(destinoPermitido('https://prod.goskip.app', ''), false)
  assert.equal(destinoPermitido('https://prod.goskip.app', 'https://teste.goskip.app'), true)
})

// P3.16-05: falha de leitura com a rotina REAL de leitura do catálogo (SPEC-3-001): mantém o último lote válido e retoma sem duplicar
test('P3.16-05: falha na leitura do Omie — lote anterior mantido; retomada pelo cursor, sem reler nem duplicar', () => {
  const anterior = { A1: { codigo: 'A1', descricao: 'velho', unidade: 'CX', ativo: true } }
  const consultadas = []
  let falha = true
  const consulta = (c) => {
    consultadas.push(c)
    if (c === 'A3' && falha) return { tipo: 'erro', detalhe: 'queda de rede' }
    return { tipo: 'ok', descricao: 'Produto ' + c, unidade: 'CX', inativo: 'N' }
  }
  const s0 = novoSync(['A1', 'A2', 'A3', 'A4', 'A5'])
  const r1 = executarSubLote(s0, consulta, { tamanho: 10, agora: AGORA })
  assert.equal(r1.parou, 'erro_transitorio')
  assert.equal(r1.estado.cursor, 2)
  assert.equal(loteCompleto(r1.estado), false)
  assert.deepEqual(escolherCatalogoAtivo(anterior, r1.estado), { ativo: anterior, trocou: false }) // último lote válido mantido
  falha = false
  const antes = consultadas.length
  const r2 = executarSubLote(r1.estado, consulta, { tamanho: 10, agora: AGORA })
  assert.equal(r2.parou, 'fim_da_lista')
  assert.deepEqual(consultadas.slice(antes), ['A3', 'A4', 'A5']) // A1 e A2 não foram relidos
  assert.equal(Object.keys(r2.estado.porCodigo).length, 5) // sem duplicar
  assert.equal(escolherCatalogoAtivo(anterior, r2.estado).trocou, true)
  // bloqueio do Omie (425): guarda de 12 h, nada é consultado antes dela
  let n = 0
  const bloqueia = () => (n++, { tipo: 'bloqueado', motivo: 'http_425' })
  const b1 = executarSubLote(novoSync(['X1', 'X2']), bloqueia, { tamanho: 10, agora: AGORA })
  const b2 = executarSubLote(b1.estado, bloqueia, { tamanho: 10, agora: new Date(AGORA.getTime() + 3600000) })
  assert.equal(b2.parou, 'aguardando_guarda')
  assert.equal(n, 1)
})
