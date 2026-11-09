// SPEC-4-004 — telas na língua da operação.
// Rodar: node --test --test-name-pattern "CA-4-16|CA-4-17|CA-4-18" tests/pcp/spec-4-004.test.mjs
//        node --test --test-name-pattern "CA-4-15" tests/pcp/spec-4-004.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import {
  mensagemDeErro, rotuloEstado, ROTULOS_ESTADO, OUTRO_ESTADO, temPadraoProibido, textoSeguro,
  semInformacao, bloqueadoPor, GENERICA_FALHA, GENERICA_CONFERIR,
} from '../../src/lib/pcp/textos.ts'

const RAIZ = new URL('../../src/', import.meta.url).pathname
const lerDir = (sub) =>
  readdirSync(join(RAIZ, sub))
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => ({ arquivo: `${sub}/${f}`, src: readFileSync(join(RAIZ, sub, f), 'utf8') }))
const paginas = () => lerDir('pages')
const componentes = () => lerDir('components') // fora de components/ui/ (subpasta)
const EXC_PATH = new URL('./spec-4-004.excecoes.json', import.meta.url).pathname
const excecoes = existsSync(EXC_PATH) ? JSON.parse(readFileSync(EXC_PATH, 'utf8')).excecoes : []

// ───────────────────────── CA-4-16: função de erro ─────────────────────────
test('CA-4-16: cada situação da tabela devolve a mensagem combinada', () => {
  assert.equal(mensagemDeErro({ status: 401 }), 'Sua sessão terminou. Entre de novo.')
  assert.equal(mensagemDeErro({ status: 403 }), 'Você não tem acesso a esta ação. Fale com o gestor.')
  assert.equal(mensagemDeErro({ status: 404 }), 'Não encontramos este registro.')
  assert.equal(
    mensagemDeErro({ status: 409 }),
    'Alguém alterou isto antes de você. A tela foi atualizada; confira e salve de novo.',
  )
  assert.equal(
    mensagemDeErro({ status: 409, response: { codigo: 'pedido_alterado_apos_autorizacao' } }),
    'O pedido mudou depois da autorização. Peça a autorização de novo.',
  )
  assert.equal(
    mensagemDeErro({ status: 422, response: { motivo: 'Informe a quantidade produzida.' } }),
    'Informe a quantidade produzida.',
  )
  assert.equal(mensagemDeErro({ status: 422 }), 'Confira os campos destacados.')
  assert.equal(
    mensagemDeErro({ status: 422, response: { codigo: 'pedido_diferente' } }),
    'A quantidade não bate com o pedido do Omie.',
  )
  assert.equal(mensagemDeErro({ status: 423 }), 'O envio ao Omie está desligado. Só o dono liga.')
  assert.equal(
    mensagemDeErro({ status: 500 }),
    'Não foi possível falar com o servidor. Tente de novo em instantes.',
  )
  assert.equal(mensagemDeErro({ status: 0 }), GENERICA_FALHA)
  assert.equal(mensagemDeErro(new Error('Failed to fetch')), GENERICA_FALHA)
  assert.equal(mensagemDeErro(undefined), GENERICA_FALHA)
})

test('CA-4-16: 425 mostra a hora da nova tentativa (horário de São Paulo) ou o texto sem hora', () => {
  assert.equal(
    mensagemDeErro({ status: 425, response: { proxima_tentativa: '2026-11-09T17:30:00Z' } }),
    'O Omie pediu uma pausa. Nova tentativa às 14:30.',
  )
  assert.equal(
    mensagemDeErro({ status: 425, proxima_tentativa: '2026-11-09T17:30:00Z' }),
    'O Omie pediu uma pausa. Nova tentativa às 14:30.',
  )
  assert.equal(mensagemDeErro({ status: 425 }), 'O Omie pediu uma pausa. Tente de novo mais tarde.')
  assert.equal(
    mensagemDeErro({ status: 425, response: { proxima_tentativa: 'sem hora válida' } }),
    'O Omie pediu uma pausa. Tente de novo mais tarde.',
  )
  assert.equal(
    mensagemDeErro({ status: 200, response: { codigo: 'omie_bloqueado' } }),
    'O Omie pediu uma pausa. Tente de novo mais tarde.',
  )
})

test('CA-4-16: motivo com padrão proibido nunca chega à tela', () => {
  for (const motivo of ['quantidade_final_zero', 'sem editar_parametros (403)', 'payload inválido', 'erro em SPEC-2-003', 'HTTP 422']) {
    const m = mensagemDeErro({ status: 422, response: { motivo } })
    assert.equal(m, GENERICA_CONFERIR, motivo)
    assert.equal(temPadraoProibido(m), false)
    assert.equal(textoSeguro(motivo), GENERICA_CONFERIR)
  }
  const m400 = mensagemDeErro({ status: 400, response: { motivo: 'campo_obrigatorio' } })
  assert.equal(m400, GENERICA_FALHA)
  assert.equal(textoSeguro('Informe o produto.'), 'Informe o produto.')
  assert.equal(textoSeguro(undefined, 'padrão'), 'padrão')
})

test('CA-4-16: código de erro desconhecido cai na mensagem genérica, sem mostrar o código', () => {
  const m = mensagemDeErro({ status: 418, response: { codigo: 'chaleira_quebrada' } })
  assert.equal(m, GENERICA_FALHA)
  assert.doesNotMatch(m, /chaleira/)
  assert.equal(mensagemDeErro({ status: 503, response: { codigo: 'x_y_z', motivo: 'falha_interna' } }), GENERICA_FALHA)
})

test('CA-4-16: palavras auxiliares (sem informação, bloqueado)', () => {
  assert.equal(semInformacao(), 'sem informação')
  assert.equal(semInformacao('saldo'), 'sem informação (saldo)')
  assert.equal(semInformacao('null'), 'sem informação')
  assert.equal(bloqueadoPor('falta a unidade'), 'bloqueado: falta a unidade')
  assert.equal(bloqueadoPor('gate_fechado'), 'bloqueado')
})

// ───────────────────────── CA-4-17: estados ─────────────────────────
const estadosUsadosPelasTelas = () => {
  const achados = new Map()
  const anota = (e, onde) => achados.set(e, [...(achados.get(e) ?? []), onde])
  for (const { arquivo, src } of [...paginas(), ...componentes()]) {
    // chaves dos mapas de rótulo de estado (ESTADO, ESTADOS, ROTULO_ESTADO, ROTULO_CONFERENCIA)
    for (const m of src.matchAll(/const (ESTADOS?|ROTULO_ESTADO|ROTULO_CONFERENCIA)\b[^=]*=\s*\{([\s\S]*?)\n\}/g))
      for (const k of m[2].matchAll(/^\s*([a-z][a-z0-9_]*):/gm)) anota(k[1], arquivo)
    // comparações com "estado"
    for (const m of src.matchAll(/\.?estado\s*(?:===|!==)\s*'([a-z][a-z0-9_]*)'/g)) anota(m[1], arquivo)
  }
  return achados
}

test('CA-4-17: todo estado usado pelas telas tem rótulo no dicionário, e o rótulo é limpo', () => {
  const faltam = []
  for (const [e, onde] of estadosUsadosPelasTelas()) if (!(e in ROTULOS_ESTADO)) faltam.push(`${e} (${[...new Set(onde)].join(', ')})`)
  assert.deepEqual(faltam, [], `estados sem rótulo: ${faltam.join('; ')}`)
  for (const [k, v] of Object.entries(ROTULOS_ESTADO)) {
    assert.ok(v && v.trim(), k)
    assert.equal(temPadraoProibido(v), false, `${k} → ${v}`)
  }
})

test('CA-4-17: estado sem rótulo mostra "outro estado" e avisa no console', () => {
  const avisos = []
  const antes = console.warn
  console.warn = (...a) => avisos.push(a.join(' '))
  try {
    assert.equal(rotuloEstado('estado_que_nao_existe'), OUTRO_ESTADO)
    assert.equal(rotuloEstado(''), OUTRO_ESTADO)
    assert.equal(rotuloEstado(null), OUTRO_ESTADO)
    assert.equal(rotuloEstado('aprovada'), 'Aprovada')
  } finally {
    console.warn = antes
  }
  assert.ok(avisos.length >= 3)
  assert.match(avisos[0], /estado_que_nao_existe/)
  assert.equal(OUTRO_ESTADO, 'outro estado')
})

// ───────────────────────── CA-4-18: subtítulo, "Como funciona" ─────────────────────────
const semComoFunciona = (src) => src.replace(/<ComoFunciona>[\s\S]*?<\/ComoFunciona>/g, '')
const textoFixoDoJsx = (src) => {
  const s = semComoFunciona(src)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  const achados = []
  for (const m of s.matchAll(/>([^<>{}]+)</g)) {
    const t = m[1].replace(/\s+/g, ' ').trim()
    if (t && !/[=;]|\bconst\b|\breturn\b|=>|\buse[A-Z]/.test(t)) achados.push(t)
  }
  return achados
}

test('CA-4-18: toda tela tem subtítulo de até 140 caracteres', () => {
  const problemas = []
  for (const { arquivo, src } of paginas()) {
    const m = src.match(/<p\b[^>]*data-subtitulo[^>]*>([\s\S]*?)<\/p>/)
    if (!m) {
      problemas.push(`${arquivo}: sem subtítulo`)
      continue
    }
    const fixo = m[1].replace(/\{[^}]*\}/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (fixo.length > 140) problemas.push(`${arquivo}: subtítulo com ${fixo.length} caracteres`)
  }
  assert.deepEqual(problemas, [])
})

test('CA-4-18: nenhum parágrafo de texto fixo com mais de 140 caracteres fora do "Como funciona"', () => {
  const problemas = []
  for (const { arquivo, src } of paginas()) {
    for (const t of textoFixoDoJsx(src)) if (t.length > 140) problemas.push(`${arquivo}: ${t.slice(0, 60)}… (${t.length})`)
    // mensagens fixas longas em textos literais
    const s = semComoFunciona(src)
    for (const m of s.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g)) {
      const t = (m[1] ?? m[2] ?? '').trim()
      if (t.length > 140 && /\s/.test(t) && !/^[\w\-:/\s.]+$/.test(t.slice(0, 12))) problemas.push(`${arquivo}: literal longo (${t.length}) ${t.slice(0, 50)}…`)
    }
  }
  assert.deepEqual(problemas, [])
})

test('CA-4-18: "Como funciona" é o componente colapsável, fechado por padrão', () => {
  const comp = readFileSync(join(RAIZ, 'components/ComoFunciona.tsx'), 'utf8')
  assert.match(comp, /Collapsible\b/)
  assert.match(comp, /Como funciona/)
  assert.doesNotMatch(comp, /defaultOpen|open=\{true\}|\bopen\b\s*=/)
  const problemas = []
  for (const { arquivo, src } of paginas()) {
    if (/<ComoFunciona\b/.test(src)) {
      if (!/import ComoFunciona from '@\/components\/ComoFunciona'/.test(src)) problemas.push(`${arquivo}: não importa o componente`)
      if (/<ComoFunciona\s+[^>]*(open|defaultOpen)/.test(src)) problemas.push(`${arquivo}: aberto por padrão`)
    }
  }
  assert.deepEqual(problemas, [])
})

// ───────────────────────── CA-4-15: varredura de padrões proibidos ─────────────────────────
const limpar = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:\w"'`])\/\/.*$/gm, '$1')
    .replace(/^import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^import\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/className=\{`[^`]*`\}/g, '')
    .replace(/className=\{[^}]*\}/g, '')
    .replace(/className="[^"]*"/g, '')
    .replace(/\b(?:to|path|href|htmlFor|id|key|type|inputMode|autoComplete|aria-label|variant|size)="[^"]*"/g, '')
    .replace(/pb\.send\([^)]*\)/g, '')

// Pedaço de código TypeScript pego por engano entre ">" e "<" (genéricos, arrow functions, atribuições).
const CODIGO_TS = /[=;]|&&|\?\.|\)\s*:|\bconst\b|\breturn\b|=>|\buse[A-Z]|\bnull\)\s*$/
const textosDaTela = (src) => {
  const s = limpar(src)
  const achados = []
  for (const m of s.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g)) achados.push((m[1] ?? m[2] ?? '').trim())
  for (const m of s.matchAll(/`([^`]*)`/g)) achados.push(m[1].replace(/\$\{[^}]*\}/g, ' ').trim())
  for (const m of s.matchAll(/>([^<>{}]+)</g)) {
    const t = m[1].replace(/\s+/g, ' ').trim()
    if (!CODIGO_TS.test(t)) achados.push(t) // trecho entre genéricos do TypeScript, não texto de tela
  }
  return achados.filter(Boolean)
}

// Valor de código usado em comparação ou chave (nunca exibido como frase): só vale para o padrão do sublinhado.
const SO_CODIGO = /^[a-z0-9_.|:\-]+$/
const SUBLINHADO = PADROES_DO_TESTE()
function PADROES_DO_TESTE() {
  return /\b[a-z]+(_[a-z0-9]+)+\b/
}

const achaProibido = (t) => {
  const padroes = [
    ['id da tarefa/critério', /\b(SPEC|CA|CL|LOOP|RQ|RN)-[A-Z]?\d/],
    ['id de 8 caracteres entre parênteses', /\([0-9a-f]{8}\)/i],
    ['termo do método', /\b(oráculos?|oraculos?|null|payloads?|hash(?:es)?|leases?|replays?|MOCK|gates?|UUIDs?|endpoints?|fixtures?)\b/i],
    ['POST', /\bPOST\b/],
    ['código HTTP', /\((401|403|404|409|422|423|425|5\d\d)\)|HTTP \d{3}/],
    ['Fase + número', /\bFase \d/],
  ]
  for (const [nome, re] of padroes) if (re.test(t)) return nome
  if (SUBLINHADO.test(t) && !SO_CODIGO.test(t)) return 'nome com sublinhado'
  return null
}

test('CA-4-15: nenhum texto de tela tem padrão proibido fora da lista de exceções', () => {
  const problemas = []
  for (const { arquivo, src } of [...paginas(), ...componentes()]) {
    for (const t of textosDaTela(src)) {
      const que = achaProibido(t)
      if (!que) continue
      const ex = excecoes.find((e) => e.arquivo === arquivo && t.includes(e.trecho))
      if (ex) {
        assert.ok(ex.motivo && ex.motivo.length > 10, `exceção sem motivo: ${ex.trecho}`)
        continue
      }
      problemas.push(`${arquivo}: [${que}] ${t.slice(0, 80)}`)
    }
  }
  assert.deepEqual(problemas, [])
})

test('CA-4-15: toda exceção da lista tem motivo e ainda é encontrada na tela', () => {
  const todos = new Map([...paginas(), ...componentes()].map((x) => [x.arquivo, x.src]))
  for (const e of excecoes) {
    assert.ok(e.arquivo && e.trecho && e.motivo, JSON.stringify(e))
    assert.ok(todos.has(e.arquivo), `arquivo inexistente: ${e.arquivo}`)
    assert.ok(todos.get(e.arquivo).includes(e.trecho), `trecho não encontrado: ${e.arquivo} → ${e.trecho}`)
  }
})

test('CA-4-15: a varredura enxerga os padrões (a própria regra acha os exemplos da SPEC)', () => {
  for (const t of ['oráculos da SPEC-2-003 (0096ab26)', 'mesmo UUID com payload diferente', 'Recorte MOCK: nenhum POST real', 'sem editar_parametros (403)', 'LOOP-01 — alertas', 'saldo ausente (null ≠ zero)', 'registra hashes', 'Painel operacional da Fase 1', 'lease de trabalhador único', 'CL-006 e CA-D4', 'replay: aprovação idêntica'])
    assert.ok(achaProibido(t) || temPadraoProibido(t), t)
  for (const t of ['Início', 'Alertas críticos tratados', 'Confira os campos destacados.', 'já registrado'])
    assert.equal(achaProibido(t), null, t)
})
