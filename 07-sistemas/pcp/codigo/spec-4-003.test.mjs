// SPEC-4-003 — menu por área e tela inicial. Rodar: node --test --test-name-pattern "CA-4-1" tests/pcp/spec-4-003.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  ITENS_MENU, ORDEM_DOS_GRUPOS, ROTAS_FORA_DO_MENU, MENSAGEM_SEM_ACESSO, itemVisivel, menuDaPessoa, grupoDaRota, tituloDaRota,
  saudacao, saudacaoCompleta, primeiroNome, dataPorExtenso, temPainel,
} from '../../src/lib/pcp/menu.ts'

// Menu de hoje (antes da SPEC): rota → área.
const AREA_DE_HOJE = {
  '/catalogo': 'catalogo', '/painel': 'painel', '/qualidade': 'painel', '/planejamento': 'planejamento', '/parametros': 'planejamento',
  '/apontamentos': 'apontar_producao', '/conferencias': 'conferir_expedicao|painel', '/sugestoes': 'painel', '/consolidacoes': 'painel',
  '/alertas': 'painel', '/historico-vendas': 'painel', '/relatorios': 'painel', '/assistente': 'painel', '/exportacao': 'painel',
  '/envio-omie': 'painel', '/fornecedores': 'compras', '/conversoes': 'compras', '/compras/historico': 'compras',
  '/compras/requisicoes': 'compras', '/compras/entregas': 'compras', '/recebimentos': 'recebimento', '/unidades': 'faturamento',
  '/pedidos/preparacao': 'faturamento', '/pedidos/manuais': 'faturamento',
}

test('CA-4-11: a lista tem exatamente as 25 entradas, cada uma com grupo, rótulo, rota, área e ícone', () => {
  assert.equal(ITENS_MENU.length, 25)
  assert.equal(ITENS_MENU.filter((i) => i.grupo === null).length, 1)
  assert.equal(ITENS_MENU[0].rotulo, 'Início')
  assert.equal(ITENS_MENU[0].rota, '/')
  for (const i of ITENS_MENU) for (const c of ['rotulo', 'rota', 'area', 'icone']) assert.ok(i[c], `${i.rota} sem ${c}`)
  for (const i of ITENS_MENU.slice(1)) assert.ok(ORDEM_DOS_GRUPOS.includes(i.grupo), i.rota)
  assert.equal(new Set(ITENS_MENU.map((i) => i.rota)).size, 25)
  assert.equal(ORDEM_DOS_GRUPOS.length, 6)
})

test('CA-4-11: a área de cada item é igual à de hoje', () => {
  for (const i of ITENS_MENU.slice(1)) assert.equal(i.area, AREA_DE_HOJE[i.rota], i.rota)
  assert.equal(Object.keys(AREA_DE_HOJE).length, 24)
})

test('CA-4-11: grupos e ícones seguem a tabela da SPEC', () => {
  const t = (rota) => ITENS_MENU.find((i) => i.rota === rota)
  assert.deepEqual([t('/apontamentos').grupo, t('/apontamentos').icone], ['Produção', 'ClipboardPen'])
  assert.deepEqual([t('/compras/historico').grupo, t('/compras/historico').icone], ['Compras', 'ChartLine'])
  assert.deepEqual([t('/recebimentos').grupo, t('/recebimentos').icone], ['Recebimento', 'PackageCheck'])
  assert.equal(t('/pedidos/preparacao').rotulo, 'Preparação de pedidos')
  assert.equal(t('/historico-vendas').rotulo, 'Sazonalidade')
  assert.equal(t('/exportacao').grupo, 'Gestão')
})

test('CA-4-11: as rotas fora do menu continuam abrindo pelos links de origem', () => {
  const fora = Object.fromEntries(ROTAS_FORA_DO_MENU.map((r) => [r.rota, r.origem]))
  assert.equal(fora['/alertas/loop'], '/alertas')
  assert.equal(fora['/parametros/alertas'], '/alertas')
  assert.equal(fora['/assistente/loop'], '/assistente')
  assert.ok(fora['/trocar-senha'])
  for (const r of ROTAS_FORA_DO_MENU) assert.equal(ITENS_MENU.some((i) => i.rota === r.rota), false)
})

test('CA-4-12: cada perfil vê só os itens das suas áreas e os grupos vazios somem', () => {
  const todas = ['painel', 'catalogo', 'planejamento', 'apontar_producao', 'conferir_expedicao', 'compras', 'recebimento', 'faturamento']
  const m = menuDaPessoa(todas)
  assert.equal(m.grupos.length, 6)
  assert.equal(m.grupos.reduce((s, g) => s + g.itens.length, 0) + 1, 25)

  const uma = menuDaPessoa(['apontar_producao'])
  assert.deepEqual(uma.grupos.map((g) => g.grupo), ['Produção'])
  assert.deepEqual(uma.grupos[0].itens.map((i) => i.rotulo), ['Apontamentos'])

  const compras = menuDaPessoa(['compras'])
  assert.deepEqual(compras.grupos.map((g) => g.grupo), ['Compras'])
  assert.equal(compras.grupos[0].itens.length, 5)

  const conf = menuDaPessoa(['conferir_expedicao'])
  assert.deepEqual(conf.grupos[0].itens.map((i) => i.rotulo), ['Conferências'])
  const pcp = menuDaPessoa(['painel'])
  assert.ok(pcp.grupos.find((g) => g.grupo === 'Produção').itens.some((i) => i.rotulo === 'Conferências'))
  assert.ok(!pcp.grupos.find((g) => g.grupo === 'Produção').itens.some((i) => i.rotulo === 'Apontamentos'))
})

test('CA-4-12: perfil sem área só tem o Início; a mensagem de acesso não liberado existe', () => {
  for (const a of [[], null, undefined]) {
    const m = menuDaPessoa(a)
    assert.equal(m.grupos.length, 0)
    assert.equal(m.inicio.rota, '/')
  }
  assert.equal(MENSAGEM_SEM_ACESSO, 'Seu acesso ainda não foi liberado. Fale com o gestor.')
  assert.equal(itemVisivel(ITENS_MENU[0], []), true)
  assert.equal(itemVisivel(ITENS_MENU[1], ['catalogo']), false)
})

test('CA-4-12: o grupo e o título seguem a rota aberta', () => {
  assert.equal(grupoDaRota('/compras/historico'), 'Compras')
  assert.equal(grupoDaRota('/parametros/alertas'), 'Produção')
  assert.equal(grupoDaRota('/alertas/loop'), 'Gestão')
  assert.equal(grupoDaRota('/'), null)
  assert.equal(tituloDaRota('/apontamentos'), 'Apontamentos')
  assert.equal(tituloDaRota('/'), 'Início')
  assert.equal(tituloDaRota('/trocar-senha'), 'Trocar senha')
  assert.equal(tituloDaRota('/nao-existe'), 'PCP American Goodies')
})

test('CA-4-14: a saudação segue o horário de São Paulo, com o primeiro nome ou sem nome', () => {
  assert.equal(saudacao(new Date('2026-11-09T12:00:00Z')), 'Bom dia') // 09:00 SP
  assert.equal(saudacao(new Date('2026-11-09T15:00:00Z')), 'Boa tarde') // 12:00 SP
  assert.equal(saudacao(new Date('2026-11-09T20:59:00Z')), 'Boa tarde') // 17:59 SP
  assert.equal(saudacao(new Date('2026-11-09T21:00:00Z')), 'Boa noite') // 18:00 SP
  assert.equal(saudacao(new Date('2026-11-09T07:59:00Z')), 'Boa noite') // 04:59 SP
  assert.equal(saudacao(new Date('2026-11-09T08:00:00Z')), 'Bom dia') // 05:00 SP
  assert.equal(primeiroNome('  Maria da Silva '), 'Maria')
  assert.equal(primeiroNome(''), '')
  assert.equal(primeiroNome(null), '')
  assert.equal(saudacaoCompleta(new Date('2026-11-09T12:00:00Z'), 'Maria da Silva'), 'Bom dia, Maria')
  assert.equal(saudacaoCompleta(new Date('2026-11-09T12:00:00Z'), ''), 'Bom dia')
  assert.match(dataPorExtenso(new Date('2026-11-09T15:00:00Z')), /9 de novembro de 2026/)
  assert.equal(temPainel(['painel']), true)
  assert.equal(temPainel(['compras']), false)
})

test('CA-4-14: a tela inicial abre para qualquer perfil ativo, sem a palavra "Fase", e o sino e o cartão são só do painel', () => {
  const app = readFileSync(new URL('../../src/App.tsx', import.meta.url), 'utf8')
  const prot = readFileSync(new URL('../../src/components/ProtectedArea.tsx', import.meta.url), 'utf8')
  const idx = readFileSync(new URL('../../src/pages/Index.tsx', import.meta.url), 'utf8')
  const lay = readFileSync(new URL('../../src/components/Layout.tsx', import.meta.url), 'utf8')
  assert.match(app, /path="\/"\s+element=\{\s*<ProtectedArea area="\*">/)
  assert.match(prot, /aceitas\.includes\('\*'\)/)
  assert.doesNotMatch(idx, /Fase/)
  assert.match(idx, /saudacaoCompleta/)
  assert.match(idx, /temPainel/)
  assert.match(idx, /Não foi possível carregar/)
  assert.match(lay, /temPainel/)
  assert.match(lay, /Trocar senha/)
  assert.match(lay, /Sair/)
  assert.match(lay, /SidebarProvider/)
  assert.match(lay, /collapsible="icon"/)
  assert.match(lay, /menuDaPessoa/)
  assert.doesNotMatch(lay, /ITENS_DEMO|DEMO_CONFERENCIA/)
})
