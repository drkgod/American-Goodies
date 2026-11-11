import pb from '@/lib/pocketbase/client'

/** Uma pessoa na lista de usuários (conta + perfil, já juntados pelo servidor). */
export interface UsuarioPCP {
  id: string
  nome: string
  email: string
  verificado: boolean
  primeira_senha_trocada: boolean
  perfil_id: string | null
  ativo: boolean
  areas: string[]
  acoes: string[]
  pontos: string[]
  pode_atualizar_fontes: boolean
  teste: boolean
}

export interface CatalogoAcesso {
  areas: string[]
  acoes: string[]
  pontos: string[]
}

export interface RespostaUsuarios {
  usuarios: UsuarioPCP[]
  total: number
  sem_perfil: number
  perfis_orfaos: number
  sou_eu: string
  catalogo: CatalogoAcesso
}

export interface EntradaNovoUsuario {
  nome: string
  email: string
  senha: string
  areas: string[]
  acoes: string[]
  pontos: string[]
  ativo: boolean
}

export interface EntradaPerfil {
  usuario: string
  ativo: boolean
  areas: string[]
  acoes: string[]
  pontos: string[]
}

/** Lista de pessoas com o perfil de cada uma (rota autorizada). */
export const listarUsuarios = () =>
  pb.send('/backend/v1/pcp/usuarios', { method: 'GET' }) as Promise<RespostaUsuarios>

/** Cria a conta e o perfil numa só operação. */
export const criarUsuario = (dados: EntradaNovoUsuario) =>
  pb.send('/backend/v1/pcp/usuarios/criar', { method: 'POST', body: dados }) as Promise<{
    ok: boolean
    usuario: string
    perfil: string
    mensagem: string
  }>

/** Altera áreas, ações, pontos e o estado do perfil de alguém. */
export const salvarPerfil = (dados: EntradaPerfil) =>
  pb.send('/backend/v1/pcp/usuarios/perfil', { method: 'POST', body: dados }) as Promise<{
    ok: boolean
    perfil: string
    mensagem: string
  }>

/** Define uma senha provisória; a pessoa escolhe a dela no próximo acesso. */
export const redefinirSenha = (usuario: string, senha_nova: string) =>
  pb.send('/backend/v1/pcp/usuarios/senha', {
    method: 'POST',
    body: { usuario, senha_nova },
  }) as Promise<{ ok: boolean; mensagem: string }>

/** Rótulos das áreas, das ações e dos pontos, para a tela não mostrar código interno. */
export const ROTULO_AREA: Record<string, string> = {
  catalogo: 'Catálogo',
  estoque: 'Estoque',
  producao: 'Produção',
  compras: 'Compras',
  pedidos: 'Pedidos',
  painel: 'Painel',
  recebimento: 'Recebimento',
  faturamento: 'Faturamento',
}

export const ROTULO_ACAO: Record<string, string> = {
  consultar_planejamento: 'Consultar o planejamento',
  editar_programacao: 'Editar a programação',
  editar_parametros: 'Editar parâmetros',
  publicar_programacao: 'Publicar a programação',
  apontar_producao: 'Apontar produção',
  conferir_expedicao: 'Conferir expedição',
  conferir_camara: 'Conferir câmara fria',
  aprovar_consolidacao: 'Aprovar consolidação',
  executar_sync_omie: 'Sincronizar com o Omie',
  consultar_faturamento: 'Consultar o faturamento',
  editar_unidade: 'Editar unidades e preços',
  consultar_compras: 'Consultar compras',
  editar_fornecedor: 'Editar fornecedores',
  editar_conversao: 'Editar conversões',
  editar_requisicao: 'Editar requisições',
  aprovar_compra: 'Aprovar compras',
  autorizar_excecao_compra: 'Autorizar exceção de compra',
  conferir_recebimento: 'Conferir recebimento',
  conferir_financeiro_recebimento: 'Conferir recebimento no financeiro',
  preparar_pedido: 'Preparar pedidos',
  conferir_volumes: 'Conferir volumes',
  liberar_faturamento: 'Liberar faturamento',
  consultar_alertas: 'Consultar alertas',
  tratar_alerta: 'Tratar alertas',
  consultar_assistente: 'Usar o assistente',
  exportar_dados: 'Exportar dados',
  validar_loop: 'Validar os ciclos de revisão',
  administrar_usuarios: 'Administrar usuários',
}

export const ROTULO_PONTO: Record<string, string> = {
  cozinha: 'Cozinha',
  triagem: 'Triagem',
  encaixotamento: 'Encaixotamento',
  expedicao: 'Expedição',
  camara_fria: 'Câmara fria',
  produto_acabado: 'Produto acabado',
}
