// Migration 0048 — marca como teste os perfis das contas sintéticas (SPEC-4-001, CA-4-34)
// As contas de teste vêm da migration 0003 (e-mail terminado em @pcp.local). Só marca perfil que já existe:
// não cria conta, perfil, senha nem acesso. Idempotente.
migrate(
  (app) => {
    let marcados = 0
    const usuarios = app.findAllRecords('users')
    for (const u of usuarios) {
      const email = String(u.email() || '')
      if (!email.endsWith('@pcp.local')) continue
      let perfil = null
      try {
        perfil = app.findFirstRecordByFilter('pcp_perfis', 'usuario = {:u}', { u: u.id })
      } catch (_) {
        continue
      }
      if (!perfil.getBool('teste')) {
        perfil.set('teste', true)
        app.save(perfil)
        marcados += 1
      }
    }
    console.log('0048: perfis marcados como teste=' + marcados)
  },
  () => {},
)
