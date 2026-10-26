# SPEC-2-000 — Acesso nominal e conciliação dos cards herdados

**Fase:** 2 · **Revisão:** 13/10/2026 (pacote liberado em09/10) · **Origem:** RQ-007; P4; CL-003.
**Tipo:** sistema · **Dono funcional:** cliente aprova; executor configura e verifica.
**Degrau da solução:** reuso do projeto Skip 62774, autenticação/backend/banco nativos; construção mínima do recorte, sem outro provider.

## Contexto e decisões fechadas

O organograma em 06_notas/organograma-2026-10.md não equivale à matriz nominal aprovada. F1 foi aceita com perfis sintéticos; três cards novos duplicam entregas homologadas.

Transição autorizada em 09/10: pendências entram nesta fase ainda abertas. Omie é fonte oficial. Construir primeiro fundamento/contratos/telas com demonstração identificada, depois conexões reais. Construir em sequência, sem pedir autorização nem teste entre tasks; sem teste humano nesta fase (emenda de 26/10): toda task fecha pela prova automática.

## Resultado observável

Pessoas aprovadas usam somente suas áreas, ações e pontos; cards duplicados do fundamento são conciliados sem repetir implementação.

## Limites e dependências

- **Inclui:** Matriz nominal, concessão/revogação nativa, permissões por ação/ponto e conciliação das três duplicatas.
- **Fora desta fase/recorte:** Atribuir alçada por cargo, conceder acesso global por padrão, recriar fundamento ou excluir cards.
- **Entradas/pré-condições:** Autorização administrativa comprovada; matriz do cliente antes de concessão real; evidências históricas do fundamento.
- **Saídas:** resultado observável e evidência sanitizada em 05_entregas/fase-2/spec-2-000/, com a prova automática por task.
- **Superfícies afetadas:** users, pcp_perfis e guards existentes; 07-sistemas/pcp/acessos.md.
- **Dependências humanas:** cliente fornece cadastro/matriz/parâmetros e decisões; executor implementa/verifica. Não inventar nomes/alçadas/prazos.

## Dados e integrações

Reusar users e pcp_perfis; adicionar ações e pontos explícitos, inicialmente vazios. Matriz versionada: conta_id, areas[], pontos[], acoes[], ativo, aprovador_ref, aprovado_em. Ações F2: consultar_planejamento, editar_programacao, editar_parametros, publicar_programacao, apontar_producao, conferir_expedicao, conferir_camara, aprovar_consolidacao, executar_sync_omie. Área ou nome do cargo nunca concede ação automaticamente. Usuário não edita o próprio perfil; executor não amplia seu papel.

### Permissão de preparação da programação

editar_programacao governa criar/editar rascunho, aceitar sugestão em rascunho e reprogramar/cancelar somente nos estados permitidos. A ação começa ausente/negada e requer concessão explícita na matriz nominal aprovada; consultar_planejamento, publicar_programacao, área ou cargo não a concedem por implicação. Publicar a versão continua exigindo publicar_programacao separadamente. Validar ação, área, ponto aplicável, demonstração e versão no servidor em cada comando.

Duplicatas recebidas: 3def6d06-709a-43ff-b9b1-c54ec113c7c1 (base), 45dc0e7d-36ef-4c2d-a333-54a667efa8ca (telas), 69ffd20a-d02b-4d23-b8b0-388eb426823b (conferência). Originais homologados: 16a7a99b-8896-4bd7-b707-3a4be1601ab6, edb85ce0-4bc8-4222-8279-607f62bfc5d4, 6209142d-685c-4f72-8887-55b220992c5d. Operador resolve duplicata por funcionalidade oficial do portal, preservando ID e referência de prova; não marcar como implementação repetida. Sem mecanismo disponível, manter aberto para tratamento pelo operador.

### Contrato transversal

Reusar código/provider/guards atuais do projeto Skip. O submódulo local foi encontrado em versão de template e não prova produção: ler código, migrations, coleções e package.json atuais pelo projeto conectado antes de alterar; não substituir frontend pelo clone antigo. src/lib/pcp e tests/pcp são destinos previstos se ausentes, não arquivos já implantados.

Novas coleções têm demonstracao e isolamento no servidor; nunca unir fixtures com snapshots reais. Autorização em cada chamada por conta ativa, ação, área e ponto. Servidor fixa autor/aplicativo/hora; negar CRUD direto de coleções operacionais, incluindo perfis administrativos funcionais. Administração de perfis/configuração não concede edição ou exclusão de eventos, conferências, aprovações ou tentativas. Contas privilegiadas da plataforma que tecnicamente contornem regras ficam fora do fluxo operacional: manutenção excepcional exige autorização, backup e registro de auditoria separado; não usar credencial privilegiada na UI nem para corrigir apontamento. Secrets só backend; logs de correlação sanitizados, sem payload/credenciais.

Quantidades preservam decimais; rejeitar não finito e quantidade inválida. IDs em texto; conversão numérica na borda somente se inteiro seguro/exato, caso contrário bloquear. Unidade/local desconhecidos não viram default; não somar unidades incompatíveis. Negócio America/Sao_Paulo, auditoriaUTC.

## Fluxo e regras

| Regra | Condição | Resultado | Exceção/ponto de parada |
|---|---|---|---|
| A1 | Matriz entregue/aprovada | Registrar conta, áreas, ações, pontos, versão e aprovador | Organograma sozinho não aprova |
| A2 | Operação em área/ponto autorizado | Servidor revalida perfil ativo e ação a cada chamada | Perfis sintéticos ficam isolados |
| A3 | Token antigo ou alteração do perfil pelo cliente | Revogação nega; atualização de papel recusada | Sem cache de outra sessão |
| A4 | Duplicata de entrega homologada | Vincular original/prova e registrar resolução oficial | Não apagar ou trocar UUID |

1. Preparar matriz sem credenciais; cliente escolhe contas e concessões, sem solicitar organograma novamente.
2. Registrar aprovação e provisionar somente contas indicadas usando autenticação nativa; testar permitido/negado.
3. Conciliar cada par de cards e a referência de evidência; preservar histórico e dados do portal.

## Erros, concorrência e recuperação

- 401/403 nega sem pistas de registros/contagens; revogação limpa sessão.409 conserva estado, exige recarga, não sobrescreve revisão.
- Dado faltante mantém rascunho e motivo; falha de leitura mantém último lote com origem/hora/aviso, bloqueando somente operação dependente.
- Comando local persistido com UUID/hash: replay igual não duplica; mudança de payload conflita. Mutação dependente usa versão esperada/transação e prova concorrente.
- **Rollback:** desativar somente rotas/flags novas, preservando painel/acesso F1 e histórico. Migrations aditivas compatíveis; não apagar coleção/evento para reverter. Efeito confirmado no ERP exige decisão e reconciliação separadas; rollback do frontend não o desfaz.

### Execução no Skip e documentação técnica mínima

Usar o projeto conectado62774; acesso ausente impede alteração do sistema, sem criar substituto. Antes de migrations/hooks, consultar pelo MCP skip_cloud_migrations_guide e skip_cloud_hooks_guide e ler código/coleções atuais. Guias verificados em13/10/2026 descrevem PocketBase v0.36/goja; confirmar versão do projeto, que não foi acessível pelo conector desta revisão.

Hooks não executam Node.js: o runner Node dos testes é externo. Rotas novas usam /backend/v1/ e um routerAdd por arquivo; UI chama pelo cliente PocketBase existente, pb.send, contra o backend gerenciado. A URL pública do frontend não é o backend. Preservar VITE_POCKETBASE_URL gerenciado; descobrir backend via skip_cloud_get_backend_url, sem sobrescrever o cliente gerado.

Guardas e mutações locais usam $app.runInTransaction, com txApp dentro da transação; chamada HTTP externa ocorre após o commit. Consultar estado HTTP explicitamente e tratar falha de transporte separadamente. Helpers do handler precisam respeitar o isolamento goja descrito no guia; não assumir globais Node ou funções de outra VM.

Depois do recorte, skip_project_apply_changes executa QA. Conferir o resultado de cada etapa e qa.test.ran: teste não executado ou script vazio não conta como prova. Se build/lint/test tiverem nomes diferentes em package.json, registrar e usar os scripts existentes equivalentes; não inventar saída aprovada. Deploy em produção exige a autorização aplicável. Registrar versão/rotas/comandos efetivamente inspecionados em 07-sistemas/pcp/ambiente-execucao.md.

## Instruções de execução para o Ethos, Codex ou Claude Code

1. Ler esta SPEC/índice operacional, registros de 07-sistemas/pcp e código real do projeto 62774. Não criar outro projeto.
2. Selecionar somente task elegível em 04_fase-atual/fase.md; respeitar leva, pré-condições e aceite anterior. Publicação conjunta não autoriza executar cadeia simultaneamente.
3. Implementar contratos/coleções/endpoints/tela do recorte, primeiro com fixtures isoladas. Reusar autenticação/componentes; não editar cliente PocketBase gerado para facilitar teste.
4. Rodar RED antes do comportamento e GREEN/regressão abaixo; registrar comando/versão/saída. npm test que apenas imprime ausência de testes não é prova.
5. Pré-condição ausente mantém task aberta; recorte independente pode seguir. Regra/contrato incompatível retorna para emenda; não preencher por suposição.
6. Ao terminar uma task com a prova automática, seguir para a próxima elegível sem pedir teste. Sem teste humano: todas as tasks fecham pela prova automática (emenda de 26/10). Publicar este pacote não executou nenhuma task da F2.

## Checklist de execução

- [ ] Task/pré-condições verificadas no estado real.
- [ ] Fundamento demonstrável antes da conexão.
- [ ] Regras/autorizações/contratos implementados no recorte.
- [ ] RED/GREEN/bordas/concorrência e regressão com prova.
- [ ] Evidência da prova automática registrada.

## Critérios de aceite

- [ ] **CA-A1:** Matriz nominal registra aprovação e escopo; ausência impede concessão real.
- [ ] **CA-A2:** Conta aprovada executa somente sua ação/área/ponto; conta sem ação recebe 403 sem dados ou contagens.
- [ ] **CA-A3:** Token anterior à revogação perde acesso; edição do próprio papel é negada; logout/troca limpa cache.
- [ ] **CA-A4:** Três duplicatas possuem vínculo com original/prova e disposição oficial registrada, sem reimplementação ou UUID inventado.

## TDD da SPEC

Fixtures e scripts serão criados pelo executor junto ao teste; esta geração não implantou produto nem testes.

| Teste | Critério | Condição/ação | Oráculo |
|---|---|---|---|
| T1 | CA-A1 | Sem matriz, tentar ativar conta real | Bloqueio com faltantes; nenhum acesso concedido |
| T2 | CA-A2 | PCP com consulta mas sem publicar; depois perfil aprovado para publicar | Primeiro403; segundo publica só seu escopo |
| T3 | CA-A3 | Revogar perfil após emitir token; forjar ações; trocar conta | 403, perfil protegido, sem dados da conta anterior |
| T4 | CA-A4 | Abrir os três pares de cards e a evidência F1 | Vínculo e disposição registrados; zero implantação do fundamento |
| T5 | CA-A2/A3 | Conta com consultar_planejamento, sem editar_programacao, tenta criar/editar rascunho e aceitar sugestão; depois ação aprovada e revogada | Primeiro403 e zero rascunho/mutação; concessão explícita permite só seu escopo; revogação volta a negar mesmo com token anterior |

| Etapa | Ação concreta | Resultado/evidência |
|---|---|---|
| RED | Criar asserções T1–T5 antes do comportamento; registrar falha de aceite, não erro de setup | red.md com critério/comando/versão/falha |
| GREEN | Menor implementação e as mesmas entradas/oráculos | Asserções/capturas/recibos; contagem de efeitos correta |
| REFACTOR/REGRESSÃO | Repetir cenários, conta sem ação, replay e concorrência; login/logout/painel/filtro/catálogo/canais F1 | Sem ampliar acesso/duplicar/perder fonte; M043055 compara com lote atual, não fixar53 eternamente |

**Comandos:** ler package.json/runner atuais no Skip e registrar comando/versão exatos. Sem runner confiável, criar testes Node nativos assert/strict em tests/pcp/spec-2-000.test.mjs e fixtures em tests/pcp/fixtures/fase-2/; rodar node --test tests/pcp/spec-2-000.test.mjs. Função pura usa mesmo módulo da aplicação ou bundle pelo Vite existente, nunca fórmula reimplementada no teste. Provas servidor usam HTTP/script contra demonstração isolada; token via ambiente seguro, jamais impresso. Rodar os scripts de build/lint existentes e o QA nativo, registrando os comandos equivalentes inspecionados em package.json; build/lint não substituem provas de aceite.

**Não técnico:** documento/card: registrar condição anterior, item exibido, ação do responsável, estado posterior e referência verificável. RED=ausência/contradição; GREEN=aprovação/vínculo comprovado; regressão preservaIDs/evidências. Para software, exigir RED/GREEN das asserções.

**Massa:** entradas e resultados da tabela; nunca promovê-los a dados/metas reais. **Erros:** sem perfil, dado/unidade ausente, replay divergente, revisão concorrente, fonte indisponível e casos específicos acima. Teste mutante real exige autorização específica de OP/quantidade/efeito.

## Handoff e operação

Demonstrar resultado ao dono funcional. Operar por ações autorizadas, acompanhar faltantes/fontes. Pendência conserva task aberta; documento não concede permissão nem substitui backend.

## Tasks vinculadas

| ID | Task | Critério/recorte | Pré-condições | Prova/evidência |
|---|---|---|---|---|
| 51356fad-e41a-47be-8f4b-2847f25115bc | Aprovar a matriz nominal de acesso (CL-003) | CA-A1 | aprovação administrativa do responsável; nenhuma concessão real por suposição | 05_entregas/fase-2/spec-2-000/; UUID acima |
| 49327a88-b7db-42e6-a5bf-641e242848d4 | Ativar e testar as contas aprovadas | CA-A2/A3 | task de matriz aprovada e aceita; autorização administrativa comprovada | 05_entregas/fase-2/spec-2-000/; UUID acima |
| 3def6d06-709a-43ff-b9b1-c54ec113c7c1 | Conciliar o card duplicado da base no Skip | CA-A4 | original homologado e evidência de fundamento; funcionalidade oficial do portal | 05_entregas/fase-2/spec-2-000/; UUID acima |
| 45dc0e7d-36ef-4c2d-a333-54a667efa8ca | Conciliar o card duplicado das telas | CA-A4 | original homologado e evidência de telas; mecanismo oficial do portal | 05_entregas/fase-2/spec-2-000/; UUID acima |
| 69ffd20a-d02b-4d23-b8b0-388eb426823b | Conciliar o card duplicado da conferência | CA-A4 | original homologado e conferência histórica; mecanismo oficial do portal | 05_entregas/fase-2/spec-2-000/; UUID acima |

Status/metadados editáveis pertencem somente ao arquivo canônico.

## Emendas

09/10/2026: geração F2 com pendências herdadas autorizadas pelo consultor. Regra/contrato diferente durante execução exige emenda rastreada.

13/10/2026: revisão documental do pacote; explicitados contratos/guardas e cenários de erro aplicáveis, com TDD acoplado. IDs e critérios existentes preservados; nenhuma task ou transação executada.

26/10/2026: retirados os testes humanos da fase 2, por decisão do consultor (Rodrigo). Todas as tasks fecham pela prova automática (RED/GREEN/regressão e QA do Skip) registrada em 05_entregas. A única trava humana que permanece é a autorização do dono antes do primeiro envio real ao Omie (6e38e5a3), porque grava no ERP — é trava de segurança, não teste. A validação final com a equipe (0d876150) foi dispensada.
