# SPEC-1-001 — Acesso ao sistema por área

**Fase:** 1  
**Status:** planejada; implementação e testes ainda não executados.  
**Dono do aceite:** responsável designado pelo cliente, a confirmar.  
**Origem:** RQ-007 / P1 / P2  
**Degrau da solução:** recurso nativo da plataforma e construção mínima — reutilizar Skip, MCP do Skip e Skip Cloud aprovados; adaptar somente o necessário ao fluxo.

## Contexto e decisões fechadas

Hoje as informações são consultadas em ferramentas distintas. O organograma será revisado para definir acesso por cargo/área. O sistema será construído no projeto Skip indicado pelo cliente, usando MCP do Skip e backend/banco nativo Skip Cloud; não provisionar banco externo.

**Pré-condição de ordem:** fundamento SPEC-1-000 aceito; conexões reais só depois da base e do acesso.

**Bloqueios de execução:** verificar a referência do projeto Skip conectado; receber/aprovar CL-003 (organograma/papéis) e acesso do executor via CL-004. Não atribuir gestor, administrador ou acesso global por suposição. A geração desta SPEC não afirma que esses insumos já chegaram.

## Resultado observável

Usuário autorizado entra no sistema e vê as áreas permitidas. Usuário sem perfil ou fora da área não obtém os dados, mesmo chamando a API diretamente.

## Limites e dependências

- Inclui login nativo existente, sessão válida, perfil ativo e autorização de leitura por área.
- Exclui redefinir autenticação da plataforma, SSO novo, acesso de franqueados e transações de ERP.
- Entradas: projeto Skip confirmado e matriz usuário→áreas aprovada; contas de teste autorizadas.
- Saídas: perfil/áreas no Skip Cloud; mapa sem segredo em 07-sistemas/pcp/acessos.md; evidências em 05_entregas/fase-1/spec-1-001/.
- Dono de aceite: responsável indicado pelo cliente; nomes e data não presumidos.
- Superfícies: autenticação existente, src/services/pcp-access.ts, guarda de telas, migrations e hooks do projeto Skip.
- Risco/plano B: sem organograma, construir apenas ambiente de teste com perfis sintéticos, sem concessão real.
- Rollback: restaurar regras/perfis anteriores por migração reversível; preservar autenticação nativa e logs necessários.

## Dados e integrações

Coleção pcp_perfis: usuario (relação à coleção auth existente), ativo (boolean), areas (seleção múltipla: catalogo, estoque, producao, compras, pedidos, painel), pode_atualizar_fontes (boolean, somente se aprovado). Um perfil por usuário; índice único. Campos created/updated nativos. Só operador técnico autorizado altera perfil; cliente comum lê no máximo seu próprio perfil e não o modifica.

Não inventar UUID de usuário. Resolver IDs na instância conectada. Registrar quem aprovou a matriz fora das credenciais. Não criar regras em branco que tornem dados públicos. Todas as cinco regras de acesso das novas coleções são declaradas; dados brutos de integração ficam inacessíveis diretamente ao usuário e são devolvidos apenas por rotas autorizadas.

Rotas próprias novas usam /backend/v1/pcp/ e autenticação nativa; serviço frontend chama pb.send. No servidor, verificar usuário, perfil ativo e área antes de consulta, contagem ou agregação. Não confiar em área enviada pelo navegador. Não escrever middleware global que interfira em administração, health ou login nativo do Skip.

## Fluxo e regras

1. Reutilizar a coleção auth existente, inspecionando o schema e migrations pelo MCP.
2. Carregar o perfil aprovado; sem perfil/ativo, negar os dados.
3. Menu mostra apenas áreas permitidas; API aplica a mesma verificação em cada requisição.
4. Sessão expirada limpa estado e pede login; não usar a existência do registro de usuário como prova de sessão válida.
5. Revogação de perfil impede a próxima consulta; limpar dados da sessão ao sair.
6. Tentativa de alterar areas/ativo/pode_atualizar_fontes pelo cliente é negada.

| Cenário | Condição | Resultado / recuperação |
|---|---|---|
| Permitido | Perfil de teste PCP com estoque e painel | Tela e consulta de estoque disponíveis |
| Proibido | Perfil Compras sem pedidos | Nenhuma linha, total ou exportação de pedidos exposta |
| Sem papel | Usuário autenticado sem pcp_perfis | Mensagem de acesso pendente; API nega |
| Expiração | Token expirado ou refresh rejeitado | Nova autenticação; nenhum dado de sessão anterior |
| Perfil forjado | Cliente tenta mudar suas áreas | Operação negada; permissão permanece inalterada |

## Instruções de execução para o Ethos

1. Ler esta SPEC e 07-sistemas/pcp/acessos.md quando existir. Pelo MCP do Skip, confirmar o projeto e consultar schema/migrations e os guias atuais de SDK, migrations e hooks.
2. Alterar somente o recorte de acesso no projeto Skip confirmado. Usar migrations novas com up/down; não reescrever migration aplicada.
3. Usar autenticação existente e Skip Cloud; dados passam por serviços frontend e autorização no servidor. Não recriar cliente PocketBase nem mudar autenticação administrativa do Skip.
4. Preparar massa sintética sem senhas publicadas; aplicar o menor recorte, rodar QA nativo do Skip e os cenários A2–A4.
5. Parar se não houver projeto inequívoco, organograma aprovado ou autorização para provisionar contas reais. Não compensar com acesso total.
6. Ao parar, o login nativo continua operando e nenhuma área não autorizada fica pública. Executar uma task por vez e aguardar confirmação do teste humano antes da seguinte.

## Checklist de execução

- [ ] Projeto e matriz de acesso confirmados.
- [ ] Coleção/perfil e todas as regras de acesso inspecionadas.
- [ ] UI e API aplicam a mesma autorização.
- [ ] Cenários permitido, negado, expiração e escalada exercitados.
- [ ] QA e evidência registrados sem tokens; teste humano aguardado/registrado.

## Critérios de aceite

- [ ] **CA-A1:** mapa do projeto e matriz aprovada registrados sem segredo; não há papel real inventado.
- [ ] **CA-A2:** perfil autorizado obtém somente sua área; perfil sem autorização não recebe dados ou contagens pela API.
- [ ] **CA-A3:** sem perfil/inativo/token expirado e alteração do próprio papel não concedem acesso.
- [ ] **CA-A4:** saída/revogação elimina acesso e dados de sessão; autenticação nativa e administração do Skip continuam funcionais.

## TDD da SPEC

| Etapa | Prova / ação verificável | Resultado esperado | Evidência |
|---|---|---|---|
| RED | Criar teste de consulta estoque permitida e pedidos negada com perfis sintéticos | Teste reprova antes da proteção, sem explorar dados reais | Relatório RED com CA-A2/A3 |
| GREEN | Entrar com perfil PCP; consultar estoque; chamar pedidos sem permissão; tentar editar perfil | Estoque permitido; pedidos e alteração do papel negados, inclusive API direta | QA Skip + respostas sanitizadas |
| REFACTOR/REGRESSÃO | Expirar token, desativar perfil, sair e entrar com outro usuário; testar login/admin nativo | Nenhum cache de outra sessão; acesso revogado; plataforma permanece acessível | Relatório CA-A4 |

**Fixtures:** usuário-teste-PCP com estoque/painel; usuário-teste-Compras com compras/painel; usuário sem perfil; perfil inativo. São exemplos de teste, não cargos aprovados.
**Erros obrigatórios:** sessão ausente/expirada, perfil ausente/inativo, tentativa de autoelevação e chamada direta de coleção.
**Comandos:** usar o runner já existente do projeto Skip e registrar o comando real no relatório; o gate nativo de QA complementa os cenários acima e não os substitui.
**Evidência:** 05_entregas/fase-1/spec-1-001/; testes e resultado, sem senhas/tokens.

### Preflight e execução reproduzível dos testes

Antes do RED, inspecionar package.json, scripts e diretório de testes do projeto Skip pelo MCP, identificar o runner e registrar seu comando exato e versão na evidência. Criar os testes desta SPEC em tests/pcp/spec-1-001.test.mjs (ou arquivo equivalente do runner já instalado) e a massa sintética em tests/pcp/fixtures/. Não modificar o cliente PocketBase gerado para facilitar teste.

Se não houver runner, o harness mínimo autorizado é node:test, sem nova dependência. Verificar node --version no ambiente de build/QA; executar node --test tests/pcp/spec-1-001.test.mjs. Normalização/cálculo usa fixtures; autorização e rotas exigem teste de integração contra backend de homologação, com URL e tokens de teste em variáveis do ambiente, nunca em código/relatório. Se Node ou backend/contas autorizadas não estiverem disponíveis, parar o recorte e registrar a dependência técnica, sem declarar prova concluída.

RED só é válido quando o teste executa e falha pela ausência do comportamento esperado (assertion/resultado incorreto); erro de ambiente, login inválido não planejado ou comando inexistente não comprova RED. GREEN requer os cenários obrigatórios, incluindo chamadas API diretas e falhas. QA nativo do Skip é adicional, não substituto desses testes.

## Teste humano do cliente

**Origem:** protocolo de aceite de execução por task. CL-003/004 são pré-condições, não testes.
Responsável designado entra com dois perfis de teste, confere as áreas, sai e confirma que nenhum dado anterior permanece. Aceite exige mensagem explícita ou registro da demonstração; não concluir por silêncio.

## Handoff e operação

Operador autorizado mantém matriz e perfis; usuário solicita ajuste de área ao responsável. Mostrar menu e uma tentativa negada. Monitorar falhas de autenticação sem registrar credencial. Até receber a matriz, manter acesso real bloqueado.

## Tasks vinculadas

| ID | Task | Critério | Prova / recorte | Pré-condição | Evidência esperada |
|---|---|---|---|---|---|
| 029ec0f7-b419-432d-b5de-5896097ea6a3 | Confirmar acessos e papéis | CA-A1 | Registrar projeto Skip e matriz nominal de acesso aprovada, sem credenciais no arquivo; usar CL-003 e CL-004 como pré-condições. | Pré-condições desta SPEC | 05_entregas/fase-1/spec-1-001/; fase 1 + título exato |
| f79b943e-452f-4950-a694-891779eacc66 | Proteger as telas e os dados por área | CA-A2, CA-A3 | Implementar autenticação nativa e proteção de rotas, coleções e consultas por área, respeitando a matriz aprovada. | Task anterior e teste humano confirmados | 05_entregas/fase-1/spec-1-001/; fase 1 + título exato |
| db079721-3633-4a14-8143-2be82cedd333 | Testar login e restrições de acesso | CA-A2–A4 | Testar acesso permitido, usuário sem papel, sessão expirada e tentativa de alteração do próprio perfil; registrar prova e obter teste humano. | Task anterior e teste humano confirmados | 05_entregas/fase-1/spec-1-001/; fase 1 + título exato |

## Emendas

Nenhuma emenda aprovada até esta revisão.
