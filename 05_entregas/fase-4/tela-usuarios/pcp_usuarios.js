// pocketbase/hooks/pcp_usuarios.js — 11/11/2026
// Gestão de usuários e perfis pela própria tela do sistema (área painel, ação administrar_usuarios).
//
// GET  /backend/v1/pcp/usuarios            lista contas + perfil (nome, e-mail, ativo, áreas, ações)
// POST /backend/v1/pcp/usuarios            cria conta + perfil { nome, email, senha, areas, acoes, pontos }
// POST /backend/v1/pcp/usuarios/perfil     altera perfil { usuario, ativo, areas, acoes, pontos }
// POST /backend/v1/pcp/usuarios/senha      redefine a senha { usuario, senha_nova }
//
// Regras que o servidor garante sozinho (nunca vêm do navegador):
//  - só quem tem perfil ativo com a área `painel` E a ação `administrar_usuarios` opera;
//  - ninguém tira o próprio acesso (nem desativa o próprio perfil, nem remove a ação);
//  - a senha nova nunca é devolvida nem registrada; a conta criada nasce exigindo troca;
//  - o e-mail não pode repetir; área e ação fora da lista conhecida são recusadas.
// Lista vazia em `acoes`/`pontos` é permitida e significa "nenhuma".

const AREAS_CONHECIDAS = [
  'catalogo',
  'estoque',
  'producao',
  'compras',
  'pedidos',
  'painel',
  'recebimento',
  'faturamento',
]
const ACOES_CONHECIDAS = [
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
  'administrar_usuarios',
]
const PONTOS_CONHECIDOS = [
  'cozinha',
  'triagem',
  'encaixotamento',
  'expedicao',
  'camara_fria',
  'produto_acabado',
]

// Lista de texto a partir do que veio no corpo ou do que está gravado no json.
function lerLista(valor) {
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
    if (chaves.length === 0) return []
    if (chaves.every((k) => /^\d+$/.test(k))) {
      return chaves
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => String(valor[k]).trim())
        .filter((x) => x !== '')
    }
  }
  return []
}

function perfilDo(usuarioId) {
  try {
    return $app.findFirstRecordByFilter('pcp_perfis', 'usuario = {:u}', { u: usuarioId })
  } catch (_) {
    return null
  }
}

// Quem pede: perfil ativo, área painel e ação administrar_usuarios.
function exigirAdministrador(auth) {
  const perfil = perfilDo(auth.id)
  if (!perfil || !perfil.getBool('ativo')) return { ok: false, motivo: 'sem_permissao' }
  const areas = perfil.getStringSlice('areas')
  const acoes = lerLista(perfil.get('acoes'))
  if (areas.indexOf('painel') === -1 || acoes.indexOf('administrar_usuarios') === -1) {
    return { ok: false, motivo: 'sem_permissao' }
  }
  return { ok: true, perfil: perfil, acoes: acoes }
}

// Valida as listas recebidas contra o que o sistema conhece.
function validarListas(areas, acoes, pontos, erros) {
  for (const a of areas) {
    if (AREAS_CONHECIDAS.indexOf(a) === -1) erros.push('área desconhecida: ' + a)
  }
  for (const a of acoes) {
    if (ACOES_CONHECIDAS.indexOf(a) === -1) erros.push('ação desconhecida: ' + a)
  }
  for (const p of pontos) {
    if (PONTOS_CONHECIDOS.indexOf(p) === -1) erros.push('ponto desconhecido: ' + p)
  }
}

function limparEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase()
}

function emailValido(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
}

// ---------------------------------------------------------------- lista

routerAdd(
  'GET',
  '/backend/v1/pcp/usuarios',
  (e) => {
    const auth = e.auth
    if (!auth) return e.unauthorizedError('Sessão ausente ou expirada.')
    const eu = exigirAdministrador(auth)
    if (!eu.ok) return e.forbiddenError('sem_permissao')

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
      catalogo: {
        areas: AREAS_CONHECIDAS,
        acoes: ACOES_CONHECIDAS,
        pontos: PONTOS_CONHECIDOS,
      },
    })
  },
  $apis.requireAuth(),
)

// ---------------------------------------------------------------- criar conta + perfil

routerAdd(
  'POST',
  '/backend/v1/pcp/usuarios',
  (e) => {
    const auth = e.auth
    if (!auth) return e.unauthorizedError('Sessão ausente ou expirada.')
    const eu = exigirAdministrador(auth)
    if (!eu.ok) return e.forbiddenError('sem_permissao')

    const b = e.requestInfo().body || {}
    const nome = String(b.nome || '').trim()
    const email = limparEmail(b.email)
    const senha = String(b.senha || '')
    const areas = lerLista(b.areas)
    const acoes = lerLista(b.acoes)
    const pontos = lerLista(b.pontos)
    const ativo = b.ativo === undefined ? true : b.ativo === true
    const podeFontes = acoes.indexOf('executar_sync_omie') !== -1

    const erros = []
    if (!nome) erros.push('nome é obrigatório')
    if (!email) erros.push('e-mail é obrigatório')
    else if (!emailValido(email)) erros.push('e-mail inválido')
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

    const users = $app.findCollectionByNameOrId('_pb_users_auth_')
    const conta = new Record(users)
    conta.setEmail(email)
    conta.setPassword(senha)
    conta.setVerified(true)
    conta.set('name', nome)
    conta.set('primeira_senha_trocada', false) // troca obrigatória no primeiro acesso
    $app.save(conta)

    const perfis = $app.findCollectionByNameOrId('pcp_perfis')
    const perfil = new Record(perfis)
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
  },
  $apis.requireAuth(),
)

// ---------------------------------------------------------------- alterar perfil

routerAdd(
  'POST',
  '/backend/v1/pcp/usuarios/perfil',
  (e) => {
    const auth = e.auth
    if (!auth) return e.unauthorizedError('Sessão ausente ou expirada.')
    const eu = exigirAdministrador(auth)
    if (!eu.ok) return e.forbiddenError('sem_permissao')

    const b = e.requestInfo().body || {}
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
      const perfis = $app.findCollectionByNameOrId('pcp_perfis')
      perfil = new Record(perfis)
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
  },
  $apis.requireAuth(),
)

// ---------------------------------------------------------------- redefinir senha

routerAdd(
  'POST',
  '/backend/v1/pcp/usuarios/senha',
  (e) => {
    const auth = e.auth
    if (!auth) return e.unauthorizedError('Sessão ausente ou expirada.')
    const eu = exigirAdministrador(auth)
    if (!eu.ok) return e.forbiddenError('sem_permissao')

    const b = e.requestInfo().body || {}
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
  },
  $apis.requireAuth(),
)
