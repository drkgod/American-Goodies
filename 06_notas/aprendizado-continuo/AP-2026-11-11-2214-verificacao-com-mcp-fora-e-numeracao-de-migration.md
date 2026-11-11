# AP-2026-11-11-2214 — conferir produção com o MCP do Skip fora; numerar migration contra as já publicadas

- **Quando:** 11/11/2026, recuperação de 22:14Z.
- **Origem:** construção do bloco da noite de 11/11 (matriz v3, resposta do suporte do Omie, espelho de hooks, tela de Usuários em Skip v0.0.226). O MCP do Skip respondeu `Forbidden` nas duas tentativas desta rodada, então nem `skip_project_status` nem `skip_file_list` estavam disponíveis.

## 1. Produção ainda pode ser provada, sem sessão e sem MCP

O endereço do backend (PocketBase) está embutido no pacote JS público do app. Sequência que funcionou:

```bash
BASE=https://mcc-automacao-fabrica-98125.goskip.app
curl -sS "$BASE/" | grep -o 'src="[^"]*"'          # /assets/index-<hash>.js
curl -sS "$BASE/assets/index-<hash>.js" -o /tmp/bundle.js
grep -o 'https://[a-z0-9.-]*goskip[a-z0-9./-]*' /tmp/bundle.js | sort -u
# -> https://mcc-automacao-fabrica-98125.shrd03.internal.goskip.dev
```

No backend interno (o domínio `*.goskip.app` é host estático e devolve o HTML do SPA em qualquer caminho):

| caminho | resposta | leitura |
|---|---|---|
| `/api/health` | 200 `API is healthy` | backend vivo |
| `/api/collections/<x>/records` | 403 `Only superusers` | sem sessão não lê dados |
| rota de hook inexistente | **404** `File not found` | não publicado |
| rota de hook publicada | **401** `requires valid record authorization token` | **está no ar** |

Ou seja: **404 × 401 distingue "não publicado" de "publicado, exige login"** — foi assim que a tela de Usuários foi provada no ar nesta rodada depois de ter dado 404 durante o bloqueio de 15:41. O bundle ainda prova o frontend: `grep -o 'administrar_usuarios\|/usuarios\|backend/v1/pcp/usuarios' /tmp/bundle.js`.

Limite declarado: isso prova deploy, não prova versão (`lastPublishedRef`) nem conteúdo do working tree. Versão do ar continua só por `skip_project_status` (AP-2026-11-06-1124).

## 2. Numeração de migration: conferir contra as publicadas, não contra o working tree

A migration da tela de Usuários foi escrita como `0048_acessos_usuarios.js`, mas o número **0048 já estava publicado** como `0048_marca_perfis_de_teste.js` (SPEC-4-001, Skip v0.0.223). Resultado: a primeira foi substituída por `0049_acessos_usuarios.js` e a antiga ficou renomeada `.substituida` no repositório de entrega.

Regra de operação: antes de escrever uma migration, listar as já aplicadas (`skip_cloud_list_migrations` ou os arquivos `pocketbase/migrations/` do projeto) e usar o próximo número **livre lá**; o working tree local pode conter arquivo renomeado/`.substituida` e esconder o número ocupado. Conferir também que o arquivo novo aparece em `skip_file_list` antes do `apply`.
