// pocketbase/migrations/0049_acessos_usuarios.js — 11/11/2026
// Duas correções aditivas e reversíveis, sem criar conta nem senha:
//  1. repara `acoes` e `pontos` de pcp_perfis: campo json pode ter sido gravado como
//     texto JSON, como lista de bytes ou como objeto vazio; volta a ser lista de texto;
//  2. marca `name` (users) como campo de exibição, para as listas mostrarem a pessoa
//     em vez do id;
//  A ação `administrar_usuarios` NÃO é concedida aqui: o dono decide quem administra.
// Down: volta `name` a não exibível e retira `administrar_usuarios`, se alguém tiver recebido depois. Os dados
// reparados NÃO são desfeitos: reverter para o formato corrompido não faz sentido.

const CAMPOS_LISTA = ['acoes', 'pontos']

// Converte qualquer formato já visto em lista de texto.
function normalizarLista(valor) {
  const lista = (v) =>
    Array.isArray(v) ? v.map((x) => String(x)).filter((x) => x !== '') : null
  if (Array.isArray(valor)) {
    // lista de bytes (o admin mostra [91,34,99,...]): decodifica e lê como JSON
    if (valor.length > 0 && valor.every((x) => typeof x === 'number')) {
      let texto = ''
      for (const b of valor) texto += String.fromCharCode(b)
      try {
        const lido = JSON.parse(texto)
        const ok = lista(lido)
        if (ok) return ok
      } catch (_) {}
      return []
    }
    return lista(valor) || []
  }
  if (typeof valor === 'string') {
    const t = valor.trim()
    if (t === '' || t === '{}' || t === '[]' || t.toLowerCase() === 'null') return []
    try {
      return lista(JSON.parse(t)) || []
    } catch (_) {
      return []
    }
  }
  if (valor && typeof valor === 'object') {
    // objeto vazio gravado por engano; objeto com chaves numerais vira lista ordenada
    const chaves = Object.keys(valor)
    if (chaves.length === 0) return []
    if (chaves.every((k) => /^\d+$/.test(k))) {
      return chaves
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => String(valor[k]))
        .filter((x) => x !== '')
    }
    return []
  }
  return []
}

// Só conta como "vazio de verdade" o que está em branco: nunca apaga permissão que não soube ler.
function vazioDeVerdade(v) {
  if (v === null || v === undefined) return true
  if (typeof v === 'string') return ['', '{}', '[]', 'null'].indexOf(v.trim().toLowerCase()) !== -1
  if (Array.isArray(v)) return v.length === 0
  if (typeof v === 'object') return Object.keys(v).length === 0
  return false
}

migrate(
  (app) => {
    // 1) reparo das listas
    let reparados = 0
    const perfis = app.findRecordsByFilter('pcp_perfis', '', 'created', 500, 0)
    for (const perfil of perfis) {
      let mudou = false
      for (const campo of CAMPOS_LISTA) {
        const atual = perfil.get(campo)
        const novo = normalizarLista(atual)
        if (novo.length === 0 && !vazioDeVerdade(atual)) {
          console.log('0049: formato não reconhecido em ' + campo + ', mantido como está')
          continue
        }
        if (JSON.stringify(atual) !== JSON.stringify(novo)) {
          perfil.set(campo, novo)
          mudou = true
        }
      }
      if (mudou) {
        app.save(perfil)
        reparados += 1
      }
    }
    console.log('0049: perfis reparados=' + reparados + ' de ' + perfis.length)

    // 2) nome de exibição na coleção de usuários
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const campoNome = users.fields.getByName('name')
    if (campoNome && !campoNome.presentable) {
      campoNome.presentable = true
      app.save(users)
    }
  },
  (app) => {
    const perfis = app.findRecordsByFilter('pcp_perfis', '', 'created', 500, 0)
    for (const perfil of perfis) {
      const acoes = normalizarLista(perfil.get('acoes'))
      if (acoes.indexOf('administrar_usuarios') !== -1) {
        perfil.set(
          'acoes',
          acoes.filter((a) => a !== 'administrar_usuarios'),
        )
        app.save(perfil)
      }
    }
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const campoNome = users.fields.getByName('name')
    if (campoNome && campoNome.presentable) {
      campoNome.presentable = false
      app.save(users)
    }
  },
)
