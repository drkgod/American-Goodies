import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import Aviso from '@/components/Aviso'
import ComoFunciona from '@/components/ComoFunciona'
import Confirmar from '@/components/Confirmar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { mensagemDeErro, textoSeguro } from '@/lib/pcp/textos'
import {
  criarUsuario,
  listarUsuarios,
  redefinirSenha,
  ROTULO_ACAO,
  ROTULO_AREA,
  ROTULO_PONTO,
  salvarPerfil,
  type RespostaUsuarios,
  type UsuarioPCP,
} from '@/services/pcp-usuarios'
import { toast } from 'sonner'

const textoDoErro = (e: any): string => {
  const d = e?.response ?? e?.data
  if (Array.isArray(d?.motivos)) return textoSeguro(d.motivos.join('; '), 'Confira os campos.')
  if (d?.erro === 'email_em_uso' || d?.erro === 'proprio_acesso') {
    return textoSeguro(d.motivo, 'Não foi possível salvar este dado.')
  }
  if (e?.status === 403) return 'Seu acesso não permite administrar usuários.'
  if (e?.status) return mensagemDeErro(e)
  return 'Não foi possível concluir agora. Tente de novo em instantes.'
}

type Editor = {
  id: string
  nome: string
  email: string
  ativo: boolean
  areas: string[]
  acoes: string[]
  pontos: string[]
}

const vazioNovo = {
  nome: '',
  email: '',
  senha: '',
  areas: [] as string[],
  acoes: [] as string[],
  pontos: [] as string[],
}

const Usuarios = () => {
  const [dados, setDados] = useState<RespostaUsuarios | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [novo, setNovo] = useState({ ...vazioNovo })
  const [editor, setEditor] = useState<Editor | null>(null)
  const [senhaDe, setSenhaDe] = useState<{ id: string; nome: string } | null>(null)
  const [senhaNova, setSenhaNova] = useState('')

  const carregar = useCallback(() => {
    listarUsuarios()
      .then((r) => {
        setDados(r)
        setErro(null)
      })
      .catch((e: any) =>
        setErro(
          e?.status === 403
            ? 'Seu acesso não permite administrar usuários.'
            : 'Não foi possível carregar as pessoas agora. Tente de novo em instantes.',
        ),
      )
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const agir = async (fn: () => Promise<any>, ok: string) => {
    setAviso(null)
    try {
      await fn()
      setAviso(ok)
      toast.success(ok, { duration: 4000 })
      return true
    } catch (e: any) {
      const msg = textoDoErro(e)
      setAviso(msg)
      toast.error(msg, { duration: Infinity, closeButton: true })
      return false
    } finally {
      carregar()
    }
  }

  const alternar = (lista: string[], valor: string) =>
    lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor]

  const catalogo = dados?.catalogo
  const semPerfil = dados?.usuarios.filter((u) => !u.perfil_id) ?? []
  const pessoas = useMemo(
    () => (dados?.usuarios ?? []).slice().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [dados],
  )

  if (erro) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-4">Usuários</h1>
        <Aviso nivel="bloqueio">{erro}</Aviso>
      </div>
    )
  }

  if (!dados || !catalogo) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-4">Usuários</h1>
        <Skeleton className="h-24 w-full" aria-label="Carregando" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Usuários</h1>
      <p className="text-sm text-muted-foreground mb-3" data-subtitulo>
        Quem entra no sistema e o que cada pessoa pode fazer.
      </p>
      <ComoFunciona>
        <p>
          Criar a pessoa aqui já cria a conta e o acesso. No primeiro acesso o sistema pede que ela
          escolha a própria senha.
        </p>
        <p>
          Área abre a tela; ação libera o que se faz nela. Quem não tem ação nenhuma só consulta.
        </p>
        <p>Desativar o acesso não apaga o histórico da pessoa: ela perde a entrada no sistema.</p>
      </ComoFunciona>

      {aviso && (
        <Aviso nivel="info">{aviso}</Aviso>
      )}

      {(dados.sem_perfil > 0 || dados.perfis_orfaos > 0) && (
        <Aviso nivel="atencao" topo>
          {dados.sem_perfil > 0 &&
            (dados.sem_perfil === 1
              ? '1 pessoa tem conta mas não tem acesso liberado. '
              : `${dados.sem_perfil} pessoas têm conta mas não têm acesso liberado. `)}
          {dados.perfis_orfaos > 0 &&
            `${dados.perfis_orfaos} perfil(is) apontam para conta que não existe mais.`}
        </Aviso>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Cadastrar uma pessoa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="novo-nome">Nome completo</Label>
              <Input
                id="novo-nome"
                value={novo.nome}
                onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="novo-email">E-mail</Label>
              <Input
                id="novo-email"
                type="email"
                autoComplete="off"
                value={novo.email}
                onChange={(e) => setNovo({ ...novo, email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="novo-senha">Senha inicial</Label>
              <Input
                id="novo-senha"
                type="text"
                autoComplete="off"
                placeholder="mínimo 8 caracteres"
                value={novo.senha}
                onChange={(e) => setNovo({ ...novo, senha: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                A pessoa troca esta senha no primeiro acesso.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Áreas</p>
            <div className="flex flex-wrap gap-2">
              {catalogo.areas.map((a) => (
                <Button
                  key={a}
                  type="button"
                  size="sm"
                  variant={novo.areas.includes(a) ? 'default' : 'outline'}
                  aria-pressed={novo.areas.includes(a)}
                  onClick={() => setNovo({ ...novo, areas: alternar(novo.areas, a) })}
                >
                  {ROTULO_AREA[a] ?? a}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Ações</p>
            <div className="flex flex-wrap gap-2">
              {catalogo.acoes.map((a) => (
                <Button
                  key={a}
                  type="button"
                  size="sm"
                  variant={novo.acoes.includes(a) ? 'default' : 'outline'}
                  aria-pressed={novo.acoes.includes(a)}
                  onClick={() => setNovo({ ...novo, acoes: alternar(novo.acoes, a) })}
                >
                  {ROTULO_ACAO[a] ?? a}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Pontos</p>
            <div className="flex flex-wrap gap-2">
              {catalogo.pontos.map((p) => (
                <Button
                  key={p}
                  type="button"
                  size="sm"
                  variant={novo.pontos.includes(p) ? 'default' : 'outline'}
                  aria-pressed={novo.pontos.includes(p)}
                  onClick={() => setNovo({ ...novo, pontos: alternar(novo.pontos, p) })}
                >
                  {ROTULO_PONTO[p] ?? p}
                </Button>
              ))}
            </div>
          </div>

          <Button
            disabled={
              !novo.nome.trim() ||
              !novo.email.trim() ||
              novo.senha.length < 8 ||
              novo.areas.length === 0
            }
            onClick={async () => {
              const ok = await agir(
                () => criarUsuario({ ...novo, ativo: true }),
                'Pessoa cadastrada com acesso.',
              )
              if (ok) setNovo({ ...vazioNovo })
            }}
          >
            Cadastrar pessoa
          </Button>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-2">Quem já tem acesso</h2>
      {pessoas.length === 0 && <p className="text-sm">Nenhuma pessoa cadastrada ainda.</p>}
      {pessoas.length > 0 && (
        <div className="overflow-x-auto">
          <Table className="w-full text-sm text-left">
            <TableHeader>
              <TableRow className="border-b text-xs text-muted-foreground">
                <TableHead className="py-2 pr-3">Pessoa</TableHead>
                <TableHead className="py-2 pr-3">Acesso</TableHead>
                <TableHead className="py-2 pr-3">Áreas</TableHead>
                <TableHead className="py-2 pr-3">Ações</TableHead>
                <TableHead className="py-2">Senha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pessoas.map((u: UsuarioPCP) => (
                <TableRow key={u.id} className="border-b align-top">
                  <TableCell className="py-2 pr-3">
                    <p className="font-medium">{u.nome || '(sem nome)'}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                    {u.id === dados.sou_eu && (
                      <Badge variant="outline" className="mt-1">
                        você
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-2 pr-3">
                    {!u.perfil_id ? (
                      <Badge variant="outline">sem perfil</Badge>
                    ) : u.ativo ? (
                      <Badge>ativo</Badge>
                    ) : (
                      <Badge variant="outline">inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-2 pr-3">
                    {u.areas.length === 0
                      ? '—'
                      : u.areas.map((a) => ROTULO_AREA[a] ?? a).join(', ')}
                  </TableCell>
                  <TableCell className="py-2 pr-3">
                    {u.acoes.length === 0
                      ? 'só consulta'
                      : u.acoes.map((a) => ROTULO_ACAO[a] ?? a).join(', ')}
                  </TableCell>
                  <TableCell className="py-2">
                    {u.primeira_senha_trocada ? 'definida pela pessoa' : 'provisória'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <h2 className="text-xl font-semibold mt-8 mb-2">Alterar o acesso de alguém</h2>
      <div className="flex flex-wrap gap-2 mb-3">
        {pessoas
          .filter((u) => u.id !== dados.sou_eu)
          .map((u) => (
            <Button
              key={u.id}
              type="button"
              size="sm"
              variant={editor?.id === u.id ? 'default' : 'outline'}
              onClick={() => {
                setSenhaDe(null)
                setEditor(
                  editor?.id === u.id
                    ? null
                    : {
                        id: u.id,
                        nome: u.nome,
                        email: u.email,
                        ativo: u.ativo,
                        areas: u.areas,
                        acoes: u.acoes,
                        pontos: u.pontos,
                      },
                )
              }}
            >
              {u.nome || u.email}
            </Button>
          ))}
      </div>

      {editor && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">{editor.nome || editor.email}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={editor.ativo ? 'default' : 'outline'}
                aria-pressed={editor.ativo}
                onClick={() => setEditor({ ...editor, ativo: !editor.ativo })}
              >
                {editor.ativo ? 'Acesso ativo' : 'Acesso desativado'}
              </Button>
              <span className="text-xs text-muted-foreground">
                Desativado, a pessoa não entra no sistema.
              </span>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Áreas</p>
              <div className="flex flex-wrap gap-2">
                {catalogo.areas.map((a) => (
                  <Button
                    key={a}
                    type="button"
                    size="sm"
                    variant={editor.areas.includes(a) ? 'default' : 'outline'}
                    aria-pressed={editor.areas.includes(a)}
                    onClick={() => setEditor({ ...editor, areas: alternar(editor.areas, a) })}
                  >
                    {ROTULO_AREA[a] ?? a}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Ações</p>
              <div className="flex flex-wrap gap-2">
                {catalogo.acoes.map((a) => (
                  <Button
                    key={a}
                    type="button"
                    size="sm"
                    variant={editor.acoes.includes(a) ? 'default' : 'outline'}
                    aria-pressed={editor.acoes.includes(a)}
                    onClick={() => setEditor({ ...editor, acoes: alternar(editor.acoes, a) })}
                  >
                    {ROTULO_ACAO[a] ?? a}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Pontos</p>
              <div className="flex flex-wrap gap-2">
                {catalogo.pontos.map((p) => (
                  <Button
                    key={p}
                    type="button"
                    size="sm"
                    variant={editor.pontos.includes(p) ? 'default' : 'outline'}
                    aria-pressed={editor.pontos.includes(p)}
                    onClick={() => setEditor({ ...editor, pontos: alternar(editor.pontos, p) })}
                  >
                    {ROTULO_PONTO[p] ?? p}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                disabled={editor.areas.length === 0}
                onClick={() =>
                  agir(
                    () =>
                      salvarPerfil({
                        usuario: editor.id,
                        ativo: editor.ativo,
                        areas: editor.areas,
                        acoes: editor.acoes,
                        pontos: editor.pontos,
                      }),
                    editor.ativo ? 'Acesso atualizado.' : 'Acesso desativado.',
                  )
                }
              >
                Salvar acesso
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSenhaDe({ id: editor.id, nome: editor.nome || editor.email })
                  setSenhaNova('')
                }}
              >
                Redefinir senha
              </Button>
            </div>

            {editor.areas.length === 0 && (
              <Aviso nivel="atencao">Escolha pelo menos uma área para salvar.</Aviso>
            )}
          </CardContent>
        </Card>
      )}

      {senhaDe && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Redefinir a senha de {senhaDe.nome}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Combine a senha provisória com a pessoa por um canal seguro. No próximo acesso ela
              escolhe a senha dela.
            </p>
            <div className="flex flex-wrap items-end gap-2">
              <div className="space-y-1">
                <Label htmlFor="senha-nova">Senha provisória</Label>
                <Input
                  id="senha-nova"
                  type="text"
                  autoComplete="off"
                  placeholder="mínimo 8 caracteres"
                  value={senhaNova}
                  onChange={(e) => setSenhaNova(e.target.value)}
                  className="max-w-xs"
                />
              </div>
              <Confirmar
                titulo="Redefinir a senha?"
                resumo={`A senha atual de ${senhaDe.nome} deixa de valer imediatamente.`}
                rotuloBotao="Redefinir"
                onConfirmar={async () => {
                  const ok = await agir(
                    () => redefinirSenha(senhaDe.id, senhaNova),
                    'Senha redefinida.',
                  )
                  if (ok) {
                    setSenhaDe(null)
                    setSenhaNova('')
                  }
                }}
              >
                <Button disabled={senhaNova.length < 8}>Redefinir senha</Button>
              </Confirmar>
              <Button variant="outline" onClick={() => setSenhaDe(null)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {semPerfil.length > 0 && (
        <p className="text-xs text-muted-foreground mt-6">
          Conta sem perfil não entra no sistema. Use “Alterar o acesso de alguém” para liberar.
        </p>
      )}
    </div>
  )
}

export default Usuarios
