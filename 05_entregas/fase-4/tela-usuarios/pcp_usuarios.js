// pocketbase/hooks/pcp_usuarios.js — 11/11/2026
// Gestão de usuários e perfis pela própria tela do sistema (área painel, ação administrar_usuarios).
//
// GET  /backend/v1/pcp/usuarios                lista contas + perfil (nome, e-mail, ativo, áreas, ações)
// POST /backend/v1/pcp/usuarios/criar          cria conta + perfil { nome, email, senha, areas, acoes, pontos }
// POST /backend/v1/pcp/usuarios/perfil         altera perfil { usuario, ativo, areas, acoes, pontos }
// POST /backend/v1/pcp/usuarios/senha          redefine a senha { usuario, senha_nova }
//
// Regras que o servidor garante sozinho (nunca vêm do navegador):
//  - só quem tem perfil ativo com a área `painel` E a ação `administrar_usuarios` opera;
//  - ninguém altera o próprio acesso;
//  - a senha nova nunca é devolvida nem registrada; a conta criada nasce exigindo troca;
//  - o e-mail não pode repetir; área, ação e ponto fora da lista conhecida são recusados;
//  - `autorizar_escrita_omie` não está na lista: é só do dono e não se concede por esta tela.
// Cada callback do PocketBase roda numa VM própria: por isso as listas e as funções de apoio
// ficam dentro de cada rota (nada declarado fora do callback é visto por ele).

routerAdd(
  'GET',
  '/backend/v1/pcp/usuarios',
  (e) => {
    const AREAS = ['catalogo', 'estoque', 'producao', 'compras', 'pedidos', 'painel', 'recebimento', 'faturamento']
    const ACOES = [
      'consultar_planejamento',
      'editar_programacao',
      'editar_parametros',
      'publicar_programacao',
      'apontar_producao',
      'conferir_expedicao',
      'conferir_camara',
      'aprovar_consolidacao',
      'executar_sync_omie',
      'consultar_faturamento',
      'editar_unidade',
      'consultar_compras',
      'editar_fornecedor',
      'editar_conversao',
      'editar_requisicao',
      'aprovar_compra',
      'autorizar_excecao_compra',
      'conferir_recebimento',
      'conferir_financeiro_recebimento',
      'preparar_pedido',
      'conferir_volumes',
      'liberar_faturamento',
      'consultar_alertas',
      'tratar_alerta',
      'consultar_assistente',
      'exportar_dados',
      'validar_loop',
      'administrar_usuarios',
    ]
    const PONTOS = ['cozinha', 'triagem', 'encaixotamento', 'expedicao', 'camara_fria', 'produto_acabado']
    const lerLista = (valor) => {
      const soTexto = (v) =>
        Array.isArray(v) ? v.map((x) => String(x).trim()).filter((x) => x !== '') : null
      if (Array.isArray(valor)) return soTexto(valor) || []
      if (typeof valor === 'string') {
        const t = valor.trim()
        if (t === '' || t === '{}' || t === '[]') return []
        try {
          return soTexto(JSON.parse(t)) || []
        } catch (_) {
          return []
        }
      }
      if (valor && typeof valor === 'object') {
        const chaves = Object.keys(valor)
        if (chaves.length > 0 && chaves.every((k) => /^\d+$/.test(k))) {
          return chaves
            .sort((a, b) => Number(a) - Number(b))
            .map((k) => String(valor[k]).trim())
            .filter((x) => x !== '')
        }
      }
      return []
    }
    const auth = e.auth
    if (!auth) return e.unauthorizedError('Sessão ausente ou expirada.')
    let eu = null
    try {
      eu = $app.findFirstRecordByFilter('pcp_perfis', 'usuario = {:u}', { u: auth.id })
    } catch (_) {}
    if (
      !eu ||
      !eu.getBool('ativo') ||
      eu.getStringSlice('areas').indexOf('painel') === -1 ||
      lerLista(eu.get('acoes')).indexOf('administrar_usuarios') === -1
    ) {
      return e.forbiddenError('sem_permissao')
    }

    const contas = $app.findRecordsByFilter('_pb_users_auth_', '', 'name,email', 1000, 0)
    const perfis = $app.findRecordsByFilter('pcp_perfis', '', 'created', 1000, 0)
    const porUsuario = {}
    for (const p of perfis) porUsuario[p.getString('usuario')] = p

    const usuarios = contas.map((c) => {
      const p = porUsuario[c.id] || null
      return {
        id: c.id,
        nome: c.getString('name') || '',
        email: c.getString('email') || '',
        verificado: c.getBool('verified'),
        primeira_senha_trocada: c.getBool('primeira_senha_trocada'),
        perfil_id: p ? p.id : null,
        ativo: p ? p.getBool('ativo') : false,
        areas: p ? p.getStringSlice('areas') : [],
        acoes: p ? lerLista(p.get('acoes')) : [],
        pontos: p ? lerLista(p.get('pontos')) : [],
        pode_atualizar_fontes: p ? p.getBool('pode_atualizar_fontes') : false,
        teste: p ? p.getBool('teste') : false,
      }
    })

    // Conta sem perfil e perfil apontando para conta apagada são os dois defeitos que a
    // tela precisa mostrar, não esconder.
    const semPerfil = usuarios.filter((u) => !u.perfil_id).length
    const ids = {}
    for (const c of contas) ids[c.id] = true
    let perfisOrfaos = 0
    for (const p of perfis) if (!ids[p.getString('usuario')]) perfisOrfaos += 1

    return e.json(200, {
      usuarios: usuarios,
      total: usuarios.length,
      sem_perfil: semPerfil,
      perfis_orfaos: perfisOrfaos,
      sou_eu: auth.id,
      catalogo: { areas: AREAS, acoes: ACOES, pontos: PONTOS },
    })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/pcp/usuarios/{acao}',
  (e) => {
    const AREAS = ['catalogo', 'estoque', 'producao', 'compras', 'pedidos', 'painel', 'recebimento', 'faturamento']
    const ACOES = [
      'consultar_planejamento',
      'editar_programacao',
      'editar_parametros',
      'publicar_programacao',
      'apontar_producao',
      'conferir_expedicao',
      'conferir_camara',
      'aprovar_consolidacao',
      'executar_sync_omie',
      'consultar_faturamento',
      'editar_unidade',
      'consultar_compras',
      'editar_fornecedor',
      'editar_conversao',
      'editar_requisicao',
      'aprovar_compra',
      'autorizar_excecao_compra',
      'conferir_recebimento',
      'conferir_financeiro_recebimento',
      'preparar_pedido',
      'conferir_volumes',
      'liberar_faturamento',
      'consultar_alertas',
      'tratar_alerta',
      'consultar_assistente',
      'exportar_dados',
      'validar_loop',
      'administrar_usuarios',
    ]
    const PONTOS = ['cozinha', 'triagem', 'encaixotamento', 'expedicao', 'camara_fria', 'produto_acabado']
    const lerLista = (valor) => {
      const soTexto = (v) =>
        Array.isArray(v) ? v.map((x) => String(x).trim()).filter((x) => x !== '') : null
      if (Array.isArray(valor)) return soTexto(valor) || []
      if (typeof valor === 'string') {
        const t = valor.trim()
        if (t === '' || t === '{}' || t === '[]') return []
        try {
          return soTexto(JSON.parse(t)) || []
        } catch (_) {
          return []
        }
      }
      if (valor && typeof valor === 'object') {
        const chaves = Object.keys(valor)
        if (chaves.length > 0 && chaves.every((k) => /^\d+$/.test(k))) {
          return chaves
            .sort((a, b) => Number(a) - Number(b))
            .map((k) => String(valor[k]).trim())
            .filter((x) => x !== '')
        }
      }
      return []
    }
    const perfilDo = (usuarioId) => {
      try {
        return $app.findFirstRecordByFilter('pcp_perfis', 'usuario = {:u}', { u: usuarioId })
      } catch (_) {
        return null
      }
    }
    const validarListas = (areas, acoes, pontos, erros) => {
      for (const a of areas) if (AREAS.indexOf(a) === -1) erros.push('área desconhecida: ' + a)
      for (const a of acoes) if (ACOES.indexOf(a) === -1) erros.push('ação desconhecida: ' + a)
      for (const p of pontos) if (PONTOS.indexOf(p) === -1) erros.push('ponto desconhecido: ' + p)
    }

    const auth = e.auth
    if (!auth) return e.unauthorizedError('Sessão ausente ou expirada.')
    const eu = perfilDo(auth.id)
    if (
      !eu ||
      !eu.getBool('ativo') ||
      eu.getStringSlice('areas').indexOf('painel') === -1 ||
      lerLista(eu.get('acoes')).indexOf('administrar_usuarios') === -1
    ) {
      return e.forbiddenError('sem_permissao')
    }
    const acao = String(e.request.pathValue('acao') || '')
    const b = e.requestInfo().body || {}

    // ------------------------------------------------ criar conta + perfil
    if (acao === 'criar') {
      const nome = String(b.nome || '').trim()
      const email = String(b.email || '')
        .trim()
        .toLowerCase()
      const senha = String(b.senha || '')
      const areas = lerLista(b.areas)
      const acoes = lerLista(b.acoes)
      const pontos = lerLista(b.pontos)
      const ativo = b.ativo === undefined ? true : b.ativo === true
      const podeFontes = acoes.indexOf('executar_sync_omie') !== -1

      const erros = []
      if (!nome) erros.push('nome é obrigatório')
      if (!email) erros.push('e-mail é obrigatório')
      else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) erros.push('e-mail inválido')
      if (senha.length < 8) erros.push('a senha inicial precisa ter pelo menos 8 caracteres')
      if (areas.length === 0) erros.push('escolha pelo menos uma área')
      validarListas(areas, acoes, pontos, erros)
      if (erros.length > 0) return e.json(422, { erro: 'dados_invalidos', motivos: erros })

      let existente = null
      try {
        existente = $app.findAuthRecordByEmail('_pb_users_auth_', email)
      } catch (_) {}
      if (existente) {
        return e.json(409, {
          erro: 'email_em_uso',
          motivo: 'Já existe uma conta com este e-mail.',
          usuario: existente.id,
        })
      }

      const conta = new Record($app.findCollectionByNameOrId('_pb_users_auth_'))
      conta.setEmail(email)
      conta.setPassword(senha)
      conta.setVerified(true)
      conta.set('name', nome)
      conta.set('primeira_senha_trocada', false) // troca obrigatória no primeiro acesso
      $app.save(conta)

      const perfil = new Record($app.findCollectionByNameOrId('pcp_perfis'))
      perfil.set('usuario', conta.id)
      perfil.set('ativo', ativo)
      perfil.set('areas', areas)
      perfil.set('acoes', acoes)
      perfil.set('pontos', pontos)
      perfil.set('pode_atualizar_fontes', podeFontes)
      $app.save(perfil)

      return e.json(200, {
        ok: true,
        usuario: conta.id,
        perfil: perfil.id,
        mensagem: 'Conta criada. No primeiro acesso o sistema pede a troca da senha.',
      })
    }

    // ------------------------------------------------ alterar perfil
    if (acao === 'perfil') {
      const usuarioId = String(b.usuario || '').trim()
      if (!usuarioId) return e.badRequestError('escolha a pessoa')
      if (usuarioId === auth.id) {
        return e.json(422, {
          erro: 'proprio_acesso',
          motivo: 'Você não pode alterar o próprio acesso. Peça a outra pessoa com essa permissão.',
        })
      }
      try {
        $app.findRecordById('_pb_users_auth_', usuarioId)
      } catch (_) {
        return e.json(404, { erro: 'usuario_nao_encontrado' })
      }
      const areas = lerLista(b.areas)
      const acoes = lerLista(b.acoes)
      const pontos = lerLista(b.pontos)
      const ativo = b.ativo === true
      const podeFontes = acoes.indexOf('executar_sync_omie') !== -1

      const erros = []
      if (areas.length === 0) erros.push('escolha pelo menos uma área')
      validarListas(areas, acoes, pontos, erros)
      if (erros.length > 0) return e.json(422, { erro: 'dados_invalidos', motivos: erros })

      let perfil = perfilDo(usuarioId)
      if (!perfil) {
        perfil = new Record($app.findCollectionByNameOrId('pcp_perfis'))
        perfil.set('usuario', usuarioId)
      }
      perfil.set('ativo', ativo)
      perfil.set('areas', areas)
      perfil.set('acoes', acoes)
      perfil.set('pontos', pontos)
      perfil.set('pode_atualizar_fontes', podeFontes)
      $app.save(perfil)

      return e.json(200, {
        ok: true,
        perfil: perfil.id,
        mensagem: ativo ? 'Acesso atualizado.' : 'Acesso desativado.',
      })
    }

    // ------------------------------------------------ redefinir senha
    if (acao === 'senha') {
      const usuarioId = String(b.usuario || '').trim()
      const senhaNova = String(b.senha_nova || '')
      if (!usuarioId) return e.badRequestError('escolha a pessoa')
      if (senhaNova.length < 8) {
        return e.json(422, {
          erro: 'dados_invalidos',
          motivos: ['a nova senha precisa ter pelo menos 8 caracteres'],
        })
      }
      let conta = null
      try {
        conta = $app.findRecordById('_pb_users_auth_', usuarioId)
      } catch (_) {
        return e.json(404, { erro: 'usuario_nao_encontrado' })
      }
      conta.setPassword(senhaNova)
      conta.set('primeira_senha_trocada', false) // a pessoa escolhe a senha dela no próximo acesso
      $app.save(conta)

      return e.json(200, {
        ok: true,
        mensagem: 'Senha redefinida. A pessoa escolhe uma nova no próximo acesso.',
      })
    }

    return e.json(404, { erro: 'acao_desconhecida' })
  },
  $apis.requireAuth(),
)
