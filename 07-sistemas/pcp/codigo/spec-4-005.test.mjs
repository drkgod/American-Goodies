// SPEC-4-005 — tabelas, campos, selos e avisos do kit.
// Rodar: node --test --test-name-pattern "CA-4-19|CA-4-21" tests/pcp/spec-4-005.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { numero, moeda, quantidade, data, hora, dataEHora, SEM_VALOR } from '../../src/lib/pcp/formato.ts'
import { ROTULOS_ESTADO, GRUPOS_SELO, grupoDoEstado } from '../../src/lib/pcp/textos.ts'

const RAIZ = new URL('../../src/', import.meta.url).pathname
const lerDir = (sub) =>
  readdirSync(join(RAIZ, sub)).filter((f) => f.endsWith('.tsx')).map((f) => ({ arquivo: `${sub}/${f}`, src: readFileSync(join(RAIZ, sub, f), 'utf8') }))
const telas = () => [...lerDir('pages'), ...lerDir('components')]

// ───────── CA-4-19: formato.ts ─────────
test('CA-4-19: número com vírgula, milhar com ponto e sem casas inúteis', () => {
  assert.equal(numero(1234.5), '1.234,5')
  assert.equal(numero(1234567), '1.234.567')
  assert.equal(numero(12.0), '12')
  assert.equal(numero(0.125), '0,125')
  assert.equal(numero('12,5'), '12,5')
  assert.equal(numero(0), '0')
})

test('CA-4-19: moeda em reais com 2 casas', () => {
  assert.equal(moeda(1234.5), 'R$ 1.234,50')
  assert.equal(moeda(0), 'R$ 0,00')
  assert.equal(moeda(-3.1), '-R$ 3,10')
})

test('CA-4-19: quantidade com unidade junto', () => {
  assert.equal(quantidade(12.5, 'kg'), '12,5 kg')
  assert.equal(quantidade(1000, 'UN'), '1.000 UN')
  assert.equal(quantidade(3, null), '3')
})

test('CA-4-19: data dd/mm/aaaa e hora HH:MM no horário de São Paulo, inclusive na virada do dia', () => {
  assert.equal(data('2026-11-09'), '09/11/2026')
  assert.equal(data('2026-11-10T02:30:00Z'), '09/11/2026') // 23:30 em SP ainda é dia 9
  assert.equal(hora('2026-11-10T02:30:00Z'), '23:30')
  assert.equal(hora('2026-11-09T17:05:00Z'), '14:05')
  assert.equal(dataEHora('2026-11-10T03:00:00Z'), '10/11/2026 00:00')
  assert.equal(hora('2026-11-09'), SEM_VALOR) // data sem hora não inventa hora
})

test('CA-4-19: valor desconhecido mostra "—", nunca 0', () => {
  for (const v of [null, undefined, '', NaN, 'abc']) {
    assert.equal(numero(v), '—')
    assert.equal(moeda(v), '—')
    assert.equal(quantidade(v, 'kg'), '—')
  }
  assert.equal(data(null), '—')
  assert.equal(hora(undefined), '—')
  assert.equal(data('não é data'), '—')
})

// ───────── CA-4-21: grupos de selo ─────────
test('CA-4-21: todo estado do dicionário tem grupo; estado sem grupo cai no neutro', () => {
  const GRUPOS = ['verde', 'amarelo', 'vermelho', 'azul', 'demonstracao', 'neutro']
  for (const e of Object.keys(ROTULOS_ESTADO)) assert.ok(GRUPOS.includes(grupoDoEstado(e)), e)
  const semGrupo = Object.keys(ROTULOS_ESTADO).filter((e) => !(e in GRUPOS_SELO))
  assert.deepEqual(semGrupo, [], `sem grupo: ${semGrupo.join(', ')}`)
  for (const e of Object.keys(GRUPOS_SELO)) assert.ok(e in ROTULOS_ESTADO, `grupo de estado fora do dicionário: ${e}`)
  assert.equal(grupoDoEstado('estado_que_nao_existe'), 'neutro')
  assert.equal(grupoDoEstado(null), 'neutro')
})

test('CA-4-21: grupos principais da SPEC', () => {
  for (const e of ['apto', 'aprovada', 'conferida', 'tratado', 'registrado']) assert.equal(grupoDoEstado(e), 'verde', e)
  for (const e of ['pendente', 'em_analise', 'aguardando', 'preparada']) assert.equal(grupoDoEstado(e), 'amarelo', e)
  for (const e of ['bloqueado', 'recusada', 'falhou']) assert.equal(grupoDoEstado(e), 'vermelho', e)
  for (const e of ['liberado', 'enviado']) assert.equal(grupoDoEstado(e), 'azul', e)
  assert.equal(grupoDoEstado('demonstracao'), 'demonstracao')
})

test('CA-4-21: o tema tem os tokens de estado e Selo e Aviso usam só tokens', () => {
  const css = readFileSync(join(RAIZ, 'main.css'), 'utf8')
  for (const t of ['success', 'warning', 'info']) {
    assert.match(css, new RegExp(`--${t}:`))
    assert.match(css, new RegExp(`--${t}-foreground:`))
  }
  for (const f of ['Selo', 'Aviso']) {
    const s = readFileSync(join(RAIZ, `components/${f}.tsx`), 'utf8')
    assert.doesNotMatch(s, /(bg|text|border)-(red|amber|yellow|green|blue|emerald|orange)-/)
  }
})

// ───────── CA-4-20 / CA-4-22: varredura (liga quando a troca das telas termina) ─────────
const PENDENTE = {}
const semComentario = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\w"'`])\/\/.*$/gm, '$1')

test('CA-4-20: sem <table, <select, cores fixas, window.alert/confirm/prompt nem "Carregando" visível', PENDENTE, () => {
  const problemas = []
  for (const { arquivo, src } of telas()) {
    const s = semComentario(src)
    if (/<table\b/.test(s)) problemas.push(`${arquivo}: <table`)
    if (/<select\b/.test(s)) problemas.push(`${arquivo}: <select`)
    if (/\b(bg|text|border)-(red|amber|yellow|green|blue|emerald)-/.test(s)) problemas.push(`${arquivo}: cor fixa`)
    if (/window\.(alert|confirm|prompt)/.test(s)) problemas.push(`${arquivo}: window.*`)
    if (/["'`>]\s*Carregando|Carregando…/.test(s.replace(/aria-label="Carregando[^"]*"/g, ''))) problemas.push(`${arquivo}: "Carregando" visível`)
  }
  assert.deepEqual(problemas, [])
})

test('CA-4-22: no máximo um Aviso com topo por tela', PENDENTE, () => {
  const problemas = []
  for (const { arquivo, src } of lerDir('pages')) {
    const n = (semComentario(src).match(/<Aviso\b[^>]*\btopo\b/g) ?? []).length
    if (n > 1) problemas.push(`${arquivo}: ${n} avisos no topo`)
  }
  assert.deepEqual(problemas, [])
})
