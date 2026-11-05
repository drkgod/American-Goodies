// Migration 0047 — teste e demonstração separados do real (SPEC-4-001, CA-4-34)
// Aditiva e reversível. Acrescenta `teste` (bool) em pcp_perfis e `demonstracao` (bool) nas coleções de
// produção, compras e faturamento. Não cria conta, senha nem acesso. Coleção inexistente é ignorada.
const COLECOES = [
  'pcp_programacoes', 'pcp_apontamentos', 'pcp_conferencias_op', 'pcp_aprovacoes_consolidacao', 'pcp_transacoes_omie',
  'pcp_requisicoes', 'pcp_cotacoes', 'pcp_aprovacoes_compra', 'pcp_pedidos_compra_vinculo', 'pcp_recebimentos',
  'pcp_pedidos_manuais', 'pcp_preparacao_pedido', 'pcp_volumes', 'pcp_liberacoes_faturamento', 'pcp_gravacoes_venda',
]
migrate(
  (app) => {
    for (const nome of COLECOES) {
      let col = null
      try { col = app.findCollectionByNameOrId(nome) } catch (_) { continue }
      if (!col.fields.getByName('demonstracao')) {
        col.fields.add(new BoolField({ name: 'demonstracao' }))
        app.save(col)
      }
    }
    const perfis = app.findCollectionByNameOrId('pcp_perfis')
    if (!perfis.fields.getByName('teste')) {
      perfis.fields.add(new BoolField({ name: 'teste' }))
      app.save(perfis)
    }
  },
  (app) => {
    for (const nome of COLECOES.concat(['pcp_perfis'])) {
      let col = null
      try { col = app.findCollectionByNameOrId(nome) } catch (_) { continue }
      const campo = nome === 'pcp_perfis' ? 'teste' : 'demonstracao'
      if (col.fields.getByName(campo)) {
        col.fields.removeByName(campo)
        app.save(col)
      }
    }
  },
)
