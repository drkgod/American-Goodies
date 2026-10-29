import { COLECOES_COMPLEMENTARES, montarPacote, resumoParaCsv } from './src/lib/pcp/exportacao.ts'
import { writeFileSync } from 'node:fs'

const AGORA = new Date('2026-10-29T21:00:00Z')
const colecoes = {}
for (const n of COLECOES_COMPLEMENTARES) colecoes[n] = { campos: ['id', 'nome'], registros: [] }
const linhas = (n, f) => Array.from({ length: n }, (_, i) => f(i))
colecoes.pcp_unidades = { campos: ['id', 'cliente_omie', 'unidade', 'tipo'], registros: linhas(2, (i) => ['u' + i, '90000' + i, 'Unidade DEMO ' + i, 'franquia']) }
colecoes.pcp_alertas = { campos: ['id', 'tipo', 'item', 'regra'], registros: [['a0', 'estoque', 'ITEM-DEMO', 'ruptura prevista; "texto com aspas" e ; ponto e vírgula']] }
colecoes.pcp_requisicoes = { campos: ['id', 'fornecedor', 'estado'], registros: linhas(3, (i) => ['r' + i, 'FORNECEDOR-DEMO', i === 0 ? 'rascunho' : 'aprovada']) }
colecoes.pcp_tabelas_preco = { campos: ['id', 'chave', 'item', 'preco'], registros: linhas(4, (i) => ['t' + i, '*', 'ITEM-DEMO-' + i, 10 + i]) }
colecoes.pcp_historico_vendas_periodo = { campos: ['id', 'periodo', 'produto', 'quantidade'], registros: linhas(50, (i) => ['h' + i, '2026-0' + ((i % 9) + 1), 'PROD-DEMO-' + (i % 5), i + 1]) }
colecoes.pcp_pedidos_manuais = { campos: ['id', 'pedido_id', 'motivo'], registros: [['m0', 'MDEMO', 'pedido com\nquebra de linha']] }
const p = montarPacote({ colecoes, contagemLeituras: { pcp_dados: 0 }, segredos: [], versaoSistema: 'DEMONSTRACAO', agora: AGORA })
const exportadas = Object.keys(p.csv)
const esperado = Object.fromEntries(p.resumo.linhas.filter((l) => l.exportada).map((l) => [l.colecao, l.registros]))
writeFileSync('restauracao-esperado.json', JSON.stringify({ resumo: p.resumo, esperado }, null, 1))
const mig = `// Migration 0001 — RESTAURAÇÃO DE DEMONSTRAÇÃO (SPEC-3-016, P3.16-04)
// AMBIENTE DE TESTE DESCARTÁVEL. Carrega um pacote de exportação de DEMONSTRAÇÃO (dados fictícios, nenhum dado
// real da American Goodies) e registra no log a contagem de registros restaurados por coleção.
// Não toca a produção. Descartar o projeto depois da prova.
migrate(
  (app) => {
    const pacote = ${JSON.stringify(p.csv)}
    const parse = (texto) => {
      const linhas = []
      let campo = ''
      let linha = []
      let aspas = false
      for (let i = 0; i < texto.length; i++) {
        const c = texto[i]
        if (aspas) {
          if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++ }
          else if (c === '"') aspas = false
          else campo += c
        } else if (c === '"') aspas = true
        else if (c === ';') { linha.push(campo); campo = '' }
        else if (c === '\\r' && texto[i + 1] === '\\n') { linha.push(campo); linhas.push(linha); linha = []; campo = ''; i++ }
        else campo += c
      }
      if (campo !== '' || linha.length > 0) { linha.push(campo); linhas.push(linha) }
      return linhas
    }
    for (const nome of Object.keys(pacote)) {
      const linhas = parse(pacote[nome])
      const cab = linhas[0].filter((c) => c !== 'id' && c !== 'created' && c !== 'updated')
      let col
      try {
        col = app.findCollectionByNameOrId(nome)
      } catch (_) {
        col = new Collection({
          name: nome, type: 'base', listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
          fields: cab.map((c) => ({ name: c, type: 'text' })).concat([
            { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
          ]),
        })
        app.save(col)
      }
      let n = 0
      for (let i = 1; i < linhas.length; i++) {
        const r = new Record(col)
        linhas[0].forEach((c, k) => { if (c !== 'id' && c !== 'created' && c !== 'updated') r.set(c, linhas[i][k] || '') })
        app.save(r)
        n++
      }
      console.log('RESTAURACAO|' + nome + '|' + n)
    }
    console.log('RESTAURACAO|FIM|' + Object.keys(pacote).length)
  },
  (app) => {
    for (const nome of ${JSON.stringify(exportadas)}) {
      try { app.delete(app.findCollectionByNameOrId(nome)) } catch (_) {}
    }
  },
)
`
writeFileSync('restauracao-migration.js', mig)
console.log(exportadas.length, 'coleções;', Object.values(esperado).reduce((a, b) => a + b, 0), 'registros')
