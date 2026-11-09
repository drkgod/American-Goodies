// SPEC-4-006 — telas do chão de fábrica no celular e no tablet (provas estáticas; a medição de largura com
// sessão aberta fica para os usuários de teste, CL-PEND-016).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const RAIZ = new URL('../../src/', import.meta.url).pathname
const pagina = (n) => readFileSync(join(RAIZ, `pages/${n}.tsx`), 'utf8')
const comp = (n) => readFileSync(join(RAIZ, `components/${n}.tsx`), 'utf8')
const QUATRO = ['Apontamentos', 'Conferencias', 'Recebimentos', 'PedidosPreparacao']

test('CA-4-24: no celular, a ação principal de cada tela fica fixa no rodapé com toque de pelo menos 44 px', () => {
  const rodape = comp('RodapeFixo')
  assert.match(rodape, /max-md:fixed/)
  assert.match(rodape, /max-md:bottom-0/)
  assert.match(rodape, /max-md:\[&>\*\]:h-12/) // 48 px
  assert.match(rodape, /max-md:\[&>\*\]:w-full/)
  assert.match(pagina('Apontamentos'), /<RodapeFixo>[\s\S]*?Registrar\s*<\/Button>/)
  assert.match(pagina('Conferencias'), /<RodapeFixo>[\s\S]*?Conferir expedição[\s\S]*?Conferir câmara[\s\S]*?<\/RodapeFixo>/)
  assert.match(pagina('Recebimentos'), /<RodapeFixo>[\s\S]*?Registrar recebimento[\s\S]*?<\/RodapeFixo>/)
  assert.match(pagina('PedidosPreparacao'), /max-md:sticky[\s\S]*?max-md:h-12[\s\S]*?Liberar para faturar/)
  const botao = readFileSync(join(RAIZ, 'components/ui/button.tsx'), 'utf8')
  assert.match(botao, /sm: 'h-9 max-md:h-11/)
  assert.match(botao, /default: 'h-10 max-md:h-11/)
})

test('CA-4-24: no celular as listas viram cartões (md:hidden) e no tablet a tabela só traz as colunas essenciais', () => {
  for (const n of ['Apontamentos', 'Conferencias', 'Recebimentos']) {
    const s = pagina(n)
    assert.match(s, /space-y-2 md:hidden/, `${n}: sem cartões`)
    assert.match(s, /hidden w-full[^"]*md:table/, `${n}: tabela não some no celular`)
  }
  assert.match(pagina('Apontamentos'), /hidden pb-2 lg:table-cell/) // coluna secundária (Autor) só no computador
  assert.match(pagina('PedidosPreparacao'), /<Card>/) // a Preparação já é uma lista de cartões
})

test('CA-4-24: filtros no painel "Filtros" no celular', () => {
  const f = comp('PainelFiltros')
  assert.match(f, /Filtros/)
  assert.match(f, /md:hidden/)
  assert.match(f, /hidden md:block/)
  assert.match(pagina('Apontamentos'), /<PainelFiltros>/)
  assert.match(pagina('Conferencias'), /<PainelFiltros>/)
})

test('CA-4-25: campos numéricos com teclado decimal e fonte de pelo menos 16 px no celular', () => {
  for (const n of QUATRO) {
    const s = pagina(n)
    if (/type="number"\s+(?=\S)(?!inputMode="decimal")/.test(s)) assert.fail(`${n}: campo numérico sem inputMode`)
  }
  assert.match(pagina('Apontamentos'), /type="number"\n\s*inputMode="decimal"/)
  const input = readFileSync(join(RAIZ, 'components/ui/input.tsx'), 'utf8')
  assert.match(input, /text-base[^']*md:text-sm/) // 16 px no celular
  const prep = pagina('PedidosPreparacao')
  for (const m of prep.matchAll(/<input[\s\S]*?className="([^"]*)"/g)) assert.match(m[1], /text-base/, 'campo nativo com fonte pequena')
})

test('CA-4-26 (parte estática): o miolo de todas as telas corta o que passa da largura e a tabela rola dentro do quadro', () => {
  const lay = comp('Layout')
  assert.match(lay, /SidebarInset className="min-w-0 overflow-x-clip"/)
  assert.match(lay, /min-w-0 flex-1 flex-col overflow-x-clip/)
  const tabela = readFileSync(join(RAIZ, 'components/ui/table.tsx'), 'utf8')
  assert.match(tabela, /overflow-auto/) // a tabela do kit rola no próprio quadro
})
