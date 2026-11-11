// SPEC-4-002 — identidade visual (proposta A aplicada). Rodar: node --test tests/pcp/spec-4-002.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../../src/main.css', import.meta.url), 'utf8')
const raiz = css.split('.dark')[0] // só o :root (modo escuro está fora de escopo)
const token = (n) => {
  const m = raiz.match(new RegExp(`--${n}:\\s*([\\d.]+)\\s+([\\d.]+)%\\s+([\\d.]+)%`))
  assert.ok(m, `token --${n} ausente`)
  return [Number(m[1]), Number(m[2]), Number(m[3])]
}
const rgb = ([h, s, l]) => {
  s /= 100; l /= 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0), f(8), f(4)].map((v) => v * 255)
}
const lum = (c) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])
}
const contraste = (a, b) => {
  const [x, y] = [lum(rgb(token(a))), lum(rgb(token(b)))].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

test('CA-4-07: os pares do tema aplicado cumprem 4,5:1', () => {
  const pares = [
    ['foreground', 'background'], ['primary-foreground', 'primary'], ['secondary-foreground', 'secondary'],
    ['muted-foreground', 'background'], ['muted-foreground', 'muted'], ['accent-foreground', 'accent'],
    ['destructive-foreground', 'destructive'], ['card-foreground', 'card'], ['success-foreground', 'success'],
    ['warning-foreground', 'warning'], ['info-foreground', 'info'],
    ['sidebar-foreground', 'sidebar-background'], ['sidebar-primary-foreground', 'sidebar-primary'],
  ]
  const falhas = pares.filter(([a, b]) => contraste(a, b) < 4.5).map(([a, b]) => `${a}/${b}: ${contraste(a, b).toFixed(2)}`)
  assert.deepEqual(falhas, [])
})

test('CA-4-07: o tema usa o marrom e o laranja da marca (proposta A: menu marrom, botão em laranja escuro)', () => {
  assert.deepEqual(token('sidebar-background'), [23, 79, 18]) // #4F260C
  assert.deepEqual(token('primary'), [24, 100, 35]) // laranja escuro do botão (#B34D00)
  assert.ok(contraste('primary-foreground', 'primary') >= 4.5)
})

test('CA-4-08: a aba mostra "PCP American Goodies", o ícone da marca e o idioma é pt-BR', () => {
  const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')
  assert.match(html, /<html lang="pt-BR">/)
  assert.match(html, /<title>PCP American Goodies<\/title>/)
  assert.match(html, /rel="icon"[^>]*favicon\.svg/)
  assert.doesNotMatch(html, /Skip \(https/)
})

test('CA-4-09: o login é centralizado, mostra a marca e o nome, e cabe em 360 px', () => {
  const s = readFileSync(new URL('../../src/pages/Login.tsx', import.meta.url), 'utf8')
  assert.match(s, /min-h-screen items-center justify-center/)
  assert.match(s, /<Marca/)
  assert.match(s, /PCP American Goodies/)
  assert.match(s, /w-full max-w-md/) // nunca passa da largura da tela
})

test('CA-4-10: a página de erro está em português e tem o botão "Voltar ao início"', () => {
  const s = readFileSync(new URL('../../src/pages/NotFound.tsx', import.meta.url), 'utf8')
  assert.match(s, /Página não encontrada/)
  assert.match(s, /Voltar ao início/)
  assert.doesNotMatch(s, /Oops|Page not found|Return to Home/)
})
