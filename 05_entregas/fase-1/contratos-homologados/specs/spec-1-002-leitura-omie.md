# SPEC-1-002 — Leitura rastreável do Omie

**Fase:** 1  
**Status:** planejada; implementação e testes ainda não executados.  
**Dono do aceite:** responsável designado pelo cliente, a confirmar.  
**Origem:** RQ-001 / RQ-012 / P1 / P2  
**Degrau da solução:** recurso nativo da plataforma e construção mínima — reutilizar Skip, MCP do Skip e Skip Cloud aprovados; adaptar somente o necessário ao fluxo.

## Contexto e decisões fechadas

Omie é a fonte principal de produtos, estoque, fichas técnicas, vendas, OPs, compras e pedidos. O backend Skip Cloud guarda snapshots e estado técnico para apresentação. Fase 1 consulta, sem incluir/baixar/editar documentos no ERP.

**Pré-condições:** SPEC-1-001 aceita; CL-001 (API/permissão Omie); projeto Skip já identificado. Reutilizar conexão/secrets existentes pelo MCP e verificar acesso. Não solicitar banco externo. Endpoints/campos concretos são comprovados na documentação oficial e na conta autorizada antes do adapter; não presumir que toda chave concede todos os recursos.

## Resultado observável

Uma atualização de leitura produz conjuntos completos por recurso com origem/horário e relatório técnico. Falha em qualquer página mantém o último conjunto completo daquele recurso, sem saldo fictício ou sucesso parcial escondido.

## Limites e dependências

- Inclui produtos, unidades, locais/saldos, estruturas/fichas, pedidos de venda, OPs e compras, com paginação e diagnóstico de recursos indisponíveis.
- Exclui escrita no Omie, saneamento físico, ajuste de receita, contas financeiras detalhadas e conector direto Lunet.
- Histórico de vendas da Fase 1 limita-se ao contexto dos pedidos e últimos 90 dias disponíveis; não calcula planejamento nesta entrega.
- Saídas: coleções técnicas Skip Cloud; contrato em 07-sistemas/pcp/contratos-omie.md; evidência em 05_entregas/fase-1/spec-1-002/.
- Acesso: pcp_perfis.pode_atualizar_fontes para iniciar atualização; leitura dos resultados filtrada por área autorizada. Só mostrar diagnóstico de fonte relacionado à área.
- Plano B: recurso bloqueado aparece indisponível; mock exclusivamente em homologação identificada.
- Rollback: desativar adapter e restaurar ponteiro do último lote completo; não apagar dados oficiais nem resetar estoque.

## Dados e integrações

| Conjunto | Campos normalizados mínimos | Regra |
|---|---|---|
| Produto/unidade | produto_id, codigo, descricao, unidade, ativo; IDs como texto | ID Omie é mestre; ausência de campo vira pendência |
| Saldo | produto_id, local_id, unidade, saldo, observado_em | Saldo numérico da fonte, inclusive negativo quando informado; null ausente não vira zero |
| Ficha | produto_id, componentes com insumo_id/unidade/quantidade | Não deduzir conversão nem corrigir receita |
| Pedido de venda | pedido_id, referência externa comprovada, cliente_id, status_original, data, itens com ID/quantidade/unidade | Preservar origem e status bruto; não exigir pagamento para pedido válido de loja própria |
| OP/compra | documento_id, produto/item, quantidade/unidade, status_original, data prevista quando exposta | Ler e listar; sem confirmar/concluir automaticamente |

Timestamps técnicos em UTC/ISO; apresentar America/Sao_Paulo. Quantidades preservam a precisão declarada pela fonte; IDs nunca são arredondados. A homologação registra campo→campo, endpoint/método de consulta, paginação, status e escopo acessível. [Catálogo oficial Omie](https://developer.omie.com.br/service-list/) orienta os recursos; a amostra da conta confirma o mapeamento.

Modelo nativo construído/reusado primeiro na SPEC-1-000; esta SPEC conecta a fonte e usa a estrutura existente, sem duplicar migrations:

- pcp_execucoes: fonte, aplicativo_ref não secreta, inicio, fim, estado, recurso, pagina/cursor, erro_codigo e mensagem sanitizada.
- pcp_lotes: fonte, recurso, aplicativo_ref, execucao, estado (staging/completo/substituido), total_itens e concluido_em.
- pcp_dados: lote (relação), chave_origem e conteudo normalizado JSON; índice único lote+chave_origem.
- pcp_fontes: fonte+recurso+aplicativo_ref únicos, lote_ativo, ultima_tentativa, ultimo_sucesso e estado_tecnico.

Cliente comum não lista/lê/muta essas coleções diretamente. Hooks autenticados devolvem apenas recorte permitido. Leitura remota usa secrets existentes no servidor; nome da chave pode ser registrado, valor não.

## Fluxo e regras

1. Comprovar contrato de consulta de cada recurso. Recurso/credencial ausente gera bloqueio localizado, sem afirmar integração real.
2. Iniciar execução por fonte/recurso. Buscar uma página por etapa, evitando rede dentro da transação de banco.
3. Guardar em lote staging e validar ID/unidade/tipo; repetição da página faz upsert pela chave do lote.
4. Depois da última página e contagem consistente, ativar o lote em transação curta; marcar anterior substituído. Um recurso com erro não substitui seu lote ativo.
5. Registrar última tentativa e último sucesso separadamente. Sem sucesso prévio, mostrar indisponível; depois de falha, antigo com aviso.
6. Retomar a mesma execução/cursor; se a fonte muda durante a paginação, reiniciar janela consistente sem declarar falso conjunto completo.
7. Proibir operações remotas de inclusão/alteração/baixa por allowlist de operações de consulta, mesmo quando o transporte HTTP usa POST.

Timeout técnico de cada chamada: 15 segundos. Falha transitória (rede/5xx/429) permite até três tentativas, em etapas separadas com próxima tentativa agendada em 2s e 5s, respeitando Retry-After quando presente; sem dormir dentro de hook/transação. 401/403 e dado inválido não repetem automaticamente. Sem paginação comprovada não liberar execução. Atualização manual disponível na F1; cadência automática só será configurada depois de confirmar janela/quota, sem bloquear o painel manual.

Rotas da aplicação: POST /backend/v1/pcp/sync/iniciar, POST /backend/v1/pcp/sync/pagina, GET /backend/v1/pcp/sync/estado. Parâmetros de fonte/recurso são allowlist; URL e operação externa não vêm do navegador. GET /backend/v1/pcp/dados recebe recurso e filtros validados, e aplica autorização por área. Não devolver body bruto da API com segredo/dado pessoal excessivo.

## Instruções de execução para o Ethos

1. Ler esta SPEC e contratos-omie.md se existente; pelo MCP do Skip, inspecionar projeto, conexão/secrets, schema, migrations e guias atuais de hooks/migrations/SDK.
2. Com CL-001, ler o catálogo oficial e provar os endpoints de consulta na conta autorizada. Registrar mapeamento e campos indisponíveis; isto é adaptação técnica, não autorização de escrita.
3. Implementar somente allowlist de leitura, lotes, ponteiros e rotas acima em Skip Cloud. Não criar segunda autoridade de saldo nem provider externo.
4. Fazer rede em etapa de hook, persistência/ativação em transação curta. Ler HTTP status explicitamente; retorno de erro não é dado.
5. Rodar fixtures e QA nativo, comparar amostra real, registrar resultado; parar no recurso sem acesso/contrato ou com semântica inconsistente.
6. Parar deixando último lote válido visível e identificando bloqueio. Uma task por vez; teste humano antes da seguinte.

## Checklist de execução

- [ ] Acesso/contrato de leitura e recursos disponíveis registrados.
- [ ] Paginação e tipos preservados, secrets somente servidor.
- [ ] Ativação atômica e repetição idempotente verificadas.
- [ ] Falha nunca vira zero ou sucesso.
- [ ] Amostra Omie e QA conferidos; nenhuma transação externa realizada.

## Critérios de aceite

- [ ] **CA-O1:** cada recurso liberado possui contrato comprovado e amostra reconciliada com Omie; segredo ausente em UI/logs.
- [ ] **CA-O2:** duas páginas completas ativam um único lote com IDs/unidades/quantidades preservados e fonte/horário.
- [ ] **CA-O3:** falha na página 2 mantém lote anterior; recurso sem sucesso aparece indisponível; 401 não gera retry infinito.
- [ ] **CA-O4:** repetir página/execução não duplica linhas, recuperação conclui uma vez e nenhuma operação remota mutante é chamada.

## TDD da SPEC

| Etapa | Prova / ação | Resultado esperado | Evidência |
|---|---|---|---|
| RED | Teste de duas páginas, página 2 falha e replay, antes do adapter | Reprova CA-O2/O3/O4 | Relatório RED |
| GREEN | Fixture página 1: P1 saldo 10 UN; página 2: P2 saldo -2 KG; ativar | Duas chaves distintas, dois saldos sem coerção; fonte/horário e um lote ativo | Contagem/payload normalizado sanitizado |
| REFACTOR/REGRESSÃO | Repetir página; simular 401, 429, timeout, ID ausente e falha da última página; retomar | Sem duplicação, sem substituição parcial, sem segredo; limites de retry respeitados | QA + rastreio da allowlist |

**Fixtures:** lote antigo P1=8 UN; duas páginas novas; fonte indisponível; registro null; saldo zero válido; negativo válido; ID longo representado como texto. Massa sintética não prova conector real.
**Comandos:** adicionar cenários ao runner existente e registrar comando/relatório; executar QA nativo do Skip. Evidência real compara pelo menos um item/documento por recurso liberado e a contagem/janela da leitura.
**Erros obrigatórios:** página incompleta, autenticação, limite, timeout, sem referência, unidade ausente e concorrência de sincronização.
**Evidência:** 05_entregas/fase-1/spec-1-002/; conta/app mascarada, sem valor de secret.

### Preflight e execução reproduzível dos testes

Antes do RED, inspecionar package.json, scripts e diretório de testes do projeto Skip pelo MCP, identificar o runner e registrar seu comando exato e versão na evidência. Criar os testes desta SPEC em tests/pcp/spec-1-002.test.mjs (ou arquivo equivalente do runner já instalado) e a massa sintética em tests/pcp/fixtures/. Não modificar o cliente PocketBase gerado para facilitar teste.

Se não houver runner, o harness mínimo autorizado é node:test, sem nova dependência. Verificar node --version no ambiente de build/QA; executar node --test tests/pcp/spec-1-002.test.mjs. Normalização/cálculo usa fixtures; autorização e rotas exigem teste de integração contra backend de homologação, com URL e tokens de teste em variáveis do ambiente, nunca em código/relatório. Se Node ou backend/contas autorizadas não estiverem disponíveis, parar o recorte e registrar a dependência técnica, sem declarar prova concluída.

RED só é válido quando o teste executa e falha pela ausência do comportamento esperado (assertion/resultado incorreto); erro de ambiente, login inválido não planejado ou comando inexistente não comprova RED. GREEN requer os cenários obrigatórios, incluindo chamadas API diretas e falhas. QA nativo do Skip é adicional, não substituto desses testes.

### Identidade, concorrência e autorização da atualização

Identidade canônica por recurso: produtos = aplicativo_ref+produto_id; unidade = aplicativo_ref+codigo_unidade; saldo = aplicativo_ref+produto_id+local_id+unidade; ficha = aplicativo_ref+produto_id e seus componentes mantêm ID de linha (ou posição de origem comprovada quando não houver ID); pedido/OP/compra = aplicativo_ref+documento_id, com itens aninhados e seus IDs de linha preservados. Se local de saldo não vier no recurso, só usar uma identidade de estoque consolidado quando essa semântica estiver comprovada; não fabricar local. Código/descrição/valor nunca substituem identidade.

pcp_fontes também guarda execucao_ativa, geracao (inteiro crescente) e lease_ate. Em transação curta, iniciar somente se não há execução ativa com lease vigente (5 minutos). Se existe, devolver o identificador vigente com estado em andamento; não iniciar B em paralelo. Renovar lease ao iniciar cada etapa. Expirou: nova execução B pode adquirir o recurso, incrementando geracao; A fica superada e não publica. Cada escrita de página e ativação exige execução ativa correspondente, geração vigente e lease válido, verificadas no servidor. Verificação/ativação do ponteiro são atômicas; A atrasada não substitui B. Na conclusão, liberar lease e marcar execução terminal.

Todas as rotas sync/iniciar e sync/pagina verificam novamente perfil ativo e pode_atualizar_fontes. sync/pagina recebe apenas execucao_id; fonte/recurso/aplicativo/cursor são carregados do registro no servidor, nunca sobrescritos por parâmetro do cliente. ID inexistente retorna erro; execução concluída retorna resultado já concluído sem nova leitura; superada/incompatível/lease expirado não avança. sync/estado devolve só metadados da área permitida. Sem permissão técnica, usuário leitor não inicia nem avança execução.

**Provas adicionais obrigatórias de CA-O2/O4:** P1/local A=10 UN e P1/local B=5 UN permanecem duas linhas; segunda solicitação durante lease devolve a execução vigente; após expirar, B adquire nova geração/conclui e A retomada não pode ativar; leitor sem pode_atualizar_fontes chama sync/pagina e recebe negação; ID inválido/fonte forjada não altera estado.

## Teste humano do cliente

**Origem:** gate de execução por task; CL-001 é fornecimento de acesso.
Responsável autorizado escolhe item e documento no Omie, compara no sistema e observa a falha simulada sobre lote anterior. Deve reconhecer fonte/horário e diferença entre indisponível e zero; registrar aceite explícito.

## Handoff e operação

Atualização manual autorizada; usuário acompanha estado. Executor resolve falha técnica; cliente responde pelo acesso e pelo dado físico. Não marcar conector aceito somente com fixture. Diário registra recurso liberado/bloqueado e como retomar.

## Tasks vinculadas

| ID | Task | Critério | Prova / recorte | Pré-condição | Evidência esperada |
|---|---|---|---|---|---|
| f39ced9b-dbae-4966-bbb5-f93da1a4573c | Conectar a leitura dos dados do Omie | CA-O1, CA-O2 | Usar o backend Skip Cloud e os acessos autorizados para ler recursos Omie; registrar contratos/mapeamentos e uma atualização completa de teste. | Pré-condições desta SPEC | 05_entregas/fase-1/spec-1-002/; fase 1 + título exato |
| ce435e2a-d6ae-4124-9e1e-4e67528dd1e8 | Recuperar atualizações interrompidas do Omie | CA-O3, CA-O4 | Preservar último lote válido, tratar falha/paginação/repetição e retomar sem duplicar registros ou chamar operações transacionais. | Task anterior e teste humano confirmados | 05_entregas/fase-1/spec-1-002/; fase 1 + título exato |
| a5b75aca-a22e-43bd-805b-e38ffc91f304 | Conferir a integração Omie com dados autorizados | CA-O1–O4 | Reconciliar amostra e contagens com o Omie, validar timeout/credencial inválida e conferir ausência de segredos e escrita no ERP. | Task anterior e teste humano confirmados | 05_entregas/fase-1/spec-1-002/; fase 1 + título exato |

## Emendas

Nenhuma emenda aprovada até esta revisão.
