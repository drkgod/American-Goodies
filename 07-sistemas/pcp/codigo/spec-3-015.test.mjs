// tests/pcp/spec-3-015.test.mjs — SPEC-3-015 CA-3-41, CA-3-42 (P3.15-01 a 03, com a IA simulada)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { detectarPedidoDeAcao, ferramentasPermitidas, interpretarResposta, responder, validarResposta } from '../../src/lib/pcp/assistente.ts'

const gestao = { ativo: true, areas: ['planejamento', 'compras', 'faturamento'], acoes: ['consultar_assistente'] }
const compras = { ativo: true, areas: ['compras'], acoes: ['consultar_assistente'] }
const semAcao = { ativo: true, areas: ['compras'], acoes: [] }

const res = (f, extra = {}) => ({ ferramenta: f, acesso: true, fonte: `fonte-${f}`, periodo: '19 a 25/10', atualizadoEm: '2026-10-25T10:12:00Z', limites: ['só dados do sistema'], dados: { n: 3 }, ...extra })

function iaSimulada({ pedir = [], texto = null, indisponivel = false } = {}) {
  let chamadas = 0
  return {
    chamadas: () => chamadas,
    conversar({ resultados }) {
      chamadas++
      if (indisponivel) return 'indisponivel'
      if (resultados.length === 0 && pedir.length > 0) return { pedirFerramentas: pedir }
      return { texto }
    },
  }
}
const json = (o) => JSON.stringify(o)

test('P3.15-01: pessoa de Compras pergunta sobre faturamento → sem acesso, sem pistas e sem executar ferramenta', () => {
  const ia = iaSimulada({ pedir: ['consultar_pedidos'], texto: json({ resposta: 'x', fontes: [], sugestao: false }) })
  const executadas = []
  const r = responder({ pergunta: 'quantos pedidos estão bloqueados?', perfil: compras, ia, executar: (f) => (executadas.push(f), res(f)) })
  // a IA pediu consultar_pedidos, mas a ferramenta está fora da área: não roda
  assert.deepEqual(executadas, [])
  assert.notEqual(r.resultado.tipo, 'respondida')
  assert.deepEqual(ferramentasPermitidas(compras), ['consultar_alertas', 'consultar_compras'])
  // perfil só com faturamento: tudo que é de compras é negado com a mesma resposta
  const fat = { ativo: true, areas: ['faturamento'], acoes: ['consultar_assistente'] }
  assert.deepEqual(ferramentasPermitidas(fat), ['consultar_alertas', 'consultar_pedidos'])
  const sem = responder({ pergunta: 'qual o status?', perfil: { ativo: true, areas: ['catalogo'], acoes: ['consultar_assistente'] }, ia: iaSimulada(), executar: res })
  assert.deepEqual(sem.resultado, { tipo: 'sem_acesso', texto: 'sem acesso' })
  assert.equal(sem.chamadasIA, 0)
  // sem a ação do assistente é a mesma resposta
  assert.deepEqual(responder({ pergunta: 'qual o status?', perfil: semAcao, ia: iaSimulada(), executar: res }).resultado, sem.resultado)
  assert.deepEqual(responder({ pergunta: 'qual o status?', perfil: null, ia: iaSimulada(), executar: res }).resultado, sem.resultado)
})

test('P3.15-02: "compre 10 KG de farinha" → recusa, tela indicada, zero chamada à IA e zero ferramenta', () => {
  const ia = iaSimulada({ texto: 'qualquer' })
  const executadas = []
  const r = responder({ pergunta: 'compre 10 KG de farinha', perfil: gestao, ia, executar: (f) => (executadas.push(f), res(f)) })
  assert.equal(r.resultado.tipo, 'acao_recusada')
  assert.ok(r.resultado.texto.includes('Compras > Requisições'))
  assert.equal(r.chamadasIA, 0)
  assert.equal(ia.chamadas(), 0)
  assert.deepEqual(executadas, [])
  for (const [frase, tela] of [
    ['aprove a compra R1', 'Compras'],
    ['libere o pedido 123 para faturar', 'Preparação'],
    ['envie o pedido ao Omie agora', 'Envio ao Omie'],
    ['publique a programação', 'Planejamento'],
    ['grave o recebimento da nota', 'tela de origem'],
  ]) {
    const d = detectarPedidoDeAcao(frase)
    assert.ok(d, frase)
    assert.ok(d.tela.includes(tela), frase)
  }
})

test('perguntas sobre o passado ou o estado não são pedido de ação', () => {
  for (const f of ['quanto compramos de farinha no mês passado?', 'o que foi aprovado ontem?', 'quais pedidos já foram liberados?', 'quantos alertas críticos estão abertos?']) {
    assert.equal(detectarPedidoDeAcao(f), null, f)
  }
})

test('P3.15-03: resposta da IA sem fonte, ou com fonte que não foi consultada, é descartada', () => {
  const consultadas = [res('consultar_alertas')]
  const semFonte = validarResposta(interpretarResposta(json({ resposta: 'há 3 alertas', fontes: [], sugestao: false })), consultadas)
  assert.deepEqual(semFonte, { tipo: 'sem_fonte', texto: 'não consegui responder com fonte' })
  const inventada = validarResposta(interpretarResposta(json({ resposta: 'há 3', fontes: [{ nome: 'relatório de custos', periodo: 'out' }], sugestao: false })), consultadas)
  assert.equal(inventada.tipo, 'sem_fonte')
  const semPeriodo = validarResposta(interpretarResposta(json({ resposta: 'há 3', fontes: [{ nome: 'fonte-consultar_alertas', periodo: '' }], sugestao: false })), consultadas)
  assert.equal(semPeriodo.tipo, 'sem_fonte')
  assert.equal(validarResposta(interpretarResposta('texto solto sem json'), consultadas).tipo, 'sem_fonte')
  assert.equal(validarResposta(null, consultadas).tipo, 'sem_fonte')
  // e por todo o fluxo
  const ia = iaSimulada({ pedir: ['consultar_alertas'], texto: json({ resposta: 'há 3 alertas', fontes: [], sugestao: false }) })
  assert.equal(responder({ pergunta: 'quantos alertas?', perfil: gestao, ia, executar: res }).resultado.tipo, 'sem_fonte')
})

test('P3.15-04 (simulado): produção da semana com fonte, período e hora; sugestão marcada como sugestão', () => {
  const ia = iaSimulada({ pedir: ['consultar_producao'], texto: json({ resposta: 'Foram produzidas 120 UN e conferidas 118.', fontes: [{ nome: 'fonte-consultar_producao', periodo: '19 a 25/10' }], sugestao: false }) })
  const r = responder({ pergunta: 'quanto produzimos na última semana e quanto foi conferido?', perfil: gestao, ia, executar: res })
  assert.equal(r.resultado.tipo, 'respondida')
  assert.deepEqual(r.resultado.fontes, [{ nome: 'fonte-consultar_producao', periodo: '19 a 25/10', atualizadoEm: '2026-10-25T10:12:00Z' }])
  assert.deepEqual(r.resultado.limites, ['só dados do sistema'])
  assert.deepEqual(r.ferramentasUsadas, ['consultar_producao'])
  const sug = responder({ pergunta: 'devo antecipar a compra de farinha?', perfil: gestao, ia: iaSimulada({ pedir: ['consultar_compras'], texto: json({ resposta: 'Considere antecipar.', fontes: [{ nome: 'fonte-consultar_compras', periodo: 'out' }], sugestao: true }) }), executar: res })
  assert.ok(sug.resultado.texto.startsWith('Sugestão (nada foi executado):'))
})

test('sem dados: diz que não há e o que falta; IA indisponível: mensagem, nada inventado', () => {
  const ia = iaSimulada({ pedir: ['consultar_producao'], texto: 'x' })
  const r = responder({ pergunta: 'e em dezembro do ano passado?', perfil: gestao, ia, executar: (f) => res(f, { semDados: true, falta: 'apontamentos de produção do período' }) })
  assert.equal(r.resultado.tipo, 'sem_dados')
  assert.deepEqual(r.resultado.falta, ['apontamentos de produção do período'])
  const off = responder({ pergunta: 'quantos alertas?', perfil: gestao, ia: iaSimulada({ indisponivel: true }), executar: res })
  assert.equal(off.resultado.tipo, 'erro_ia')
})

test('ferramenta que devolve "sem acesso" não vira fonte; e a IA não passa de 4 rodadas', () => {
  const sem = validarResposta(interpretarResposta(json({ resposta: 'x', fontes: [{ nome: 'fonte-consultar_pedidos', periodo: 'out' }], sugestao: false })), [res('consultar_pedidos', { acesso: false })])
  assert.equal(sem.tipo, 'sem_fonte')
  let n = 0
  const teimosa = { conversar: () => (n++, { pedirFerramentas: ['consultar_alertas'] }) }
  const r = responder({ pergunta: 'alertas?', perfil: gestao, ia: teimosa, executar: res })
  assert.equal(r.resultado.tipo, 'sem_fonte')
  assert.ok(n <= 4)
})
