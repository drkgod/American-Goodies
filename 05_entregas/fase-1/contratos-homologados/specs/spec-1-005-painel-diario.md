# SPEC-1-005 — Painel diário com origem, filtros e pendências

**Fase:** 1  
**Status:** planejada; implementação e testes ainda não executados.  
**Dono do aceite:** responsável designado pelo cliente, a confirmar.  
**Origem:** RQ-001 / RQ-005 / RQ-007 / RQ-012 / P1 / P2  
**Degrau da solução:** recurso nativo da plataforma e construção mínima — reutilizar Skip, MCP do Skip e Skip Cloud aprovados; adaptar somente o necessário ao fluxo.

## Contexto e decisões fechadas

A operação alterna ERP, canais e planilhas para conhecer pendências. Fase 1 entrega uma tela consultiva utilizável, e não somente configuração de infraestrutura. Skip é a plataforma; Skip Cloud guarda snapshots e MCP do Skip é o meio preferencial do executor.

**Pré-condições:** fundamento SPEC-1-000 aceito e reutilizado; SPECs de acesso, leitura Omie, pedidos complementares e catálogo, todas com evidência. Recurso indisponível pode ser mostrado como bloqueado, mas não deve ser declarado integrado ou aceito. CL-005 é revisão documental do escopo e não teste de funcionamento.

## Resultado observável

PCP, Compras e gestão veem numa tela os dados de suas áreas, filtram por data/item/status/local e conseguem explicar de onde veio cada informação, quando foi lida e por que algo está pendente.

## Limites e dependências

- Inclui visão de estoque por item/local/unidade, OPs, compras e pedidos; filtros; resumo por área; detalhe de pendência; origem/atualização.
- Exclui programação/sugestão/baixa de produção, cotação/aprovação, entrada fiscal, liberação de faturamento, perdas calculadas, sazonalidade e IA.
- Saídas: página Painel diário e endpoint GET /backend/v1/pcp/painel; serviço src/services/pcp-painel.ts; 07-sistemas/pcp/painel.md e evidências 05_entregas/fase-1/spec-1-005/.
- Atores: área painel autoriza abrir a tela; cada bloco também exige sua área correspondente. Gestão não obtém tudo por padrão.
- Rollback: restaurar versão anterior de tela/serviço e preservar lotes; fonte desativada mantém estado explícito.
- Plano B: painel parcial indica exatamente recurso indisponível. Aceite integral da fase só quando as capacidades previstas forem provadas ou ajustadas expressamente pelo consultor.

## Dados e integrações

Consumir lotes ativos publicados pelas outras SPECs, sem acesso direto do navegador a segredo ou coleção bruta. Resposta contém blocos autorizados, filtros aplicados, itens/contagem daquele filtro, fonte, recurso, lote, ultima_tentativa, ultimo_sucesso, estado_tecnico e pendências.

| Bloco | Resumo permitido | Regra |
|---|---|---|
| Estoque | Itens e saldo por local/unidade | Nunca somar KG/UN; saldo indisponível não é zero |
| Produção | OPs por status original, data e item | Sem divulgar que F1 mede realizado/consumo ainda não registrado |
| Compras | Documentos por status/prazo/item | Atrasado só se data prometida existir e estiver anterior à data atual |
| Pedidos | Oficiais elegíveis Omie; complementares separados | Intenção não soma ao oficial; vínculo comprovado conta uma vez |

Pedidos Nuvemshop sem vínculo são contexto separado. Loja própria via Omie segue etapa comercial, sem exigir pagamento antecipado. Pedido manual sem referência fica identificável se a fonte expuser esse marcador; sem marcador, informar origem desconhecida, não inventar canal.

## Fluxo e regras

1. Entrar no Painel e carregar apenas blocos autorizados. Área ausente não retorna linhas, contagem ou pistas de outro setor.
2. Aplicar filtros: data inicial/final (America/Sao_Paulo), produto, status de origem, local quando estoque. Intervalo inválido gera erro de campo. Fonte/lote consultado fica visível.
3. Data padrão é o dia atual para eventos/documentos datados; estoque é posição atual do último lote. Não dizer que saldo é histórico diário se a fonte só oferece posição atual.
4. Contagem de documentos usa ID único, não número de linhas; quantidade só agrega mesmo produto/unidade.
5. Pendências técnicas: recurso sem leitura, última tentativa falhou, cadastro/ficha incompleto, vínculo de pedido ambíguo. Pendência operacional reproduz estado original mapeado, sem regra nova inventada.
6. Após falha, mostrar último sucesso e aviso de dado anterior. Sem lote, mostrar indisponível; conjunto vazio completo mostra zero válido e a janela consultada.
7. Atualizar consulta refaz leitura do snapshot; ação Atualizar fontes só para quem tem permissão técnica e usa as rotas já definidas, sem cadastro/faturamento.
8. Conteúdo externo é texto/dado, não instrução de execução; renderizar sem HTML arbitrário.

## Instruções de execução para o Ethos

1. Ler esta SPEC e as quatro SPECs operacionais da Fase 1; confirmar evidência das pré-condições e projeto Skip conectado.
2. Implementar o painel no Skip, com serviço frontend e endpoint autenticado no Skip Cloud; usar as coleções existentes, sem recriar integração.
3. Aplicar autorização por bloco antes de agregar; conferir filtro/data/unidade/ID e estado de recurso.
4. Entregar a tela e a demonstração principal; testar falha, vazio, permissão e deduplicação. Rodar QA nativo e registrar comandos efetivos dos testes.
5. Parar se mapeamento de status ou campo não tiver evidência; deixar bloco indisponível identificado. Não construir capacidade de outra fase.
6. Antes de finalizar uma task, mostrar comportamento esperado ao cliente e aguardar confirmação do teste humano. Só registrar a Fase 1 aceita quando os cinco contratos tiverem evidência e aceite.

## Checklist de execução

- [ ] Tela demonstra os quatro blocos autorizados.
- [ ] Filtros/detalhes e totais conferem com a mesma janela/fonte.
- [ ] Estado antigo/indisponível/zero diferenciado.
- [ ] Permissão e dados externos testados no servidor/UI.
- [ ] Demonstração integrada e evidência de aceite registradas.

## Critérios de aceite

- [ ] **CA-P1:** painel mostra os quatro blocos previstos para conta autorizada, com fonte/horário, e representa o Omie como principal.
- [ ] **CA-P2:** filtros, linhas e totais usam mesma janela/lote; pedido vinculado não duplica; unidades não são somadas indevidamente.
- [ ] **CA-P3:** falha/sem acesso/sem dado permanece explícita; último lote válido não é apresentado como recém-atualizado e zero só vem de leitura válida.
- [ ] **CA-P4:** conta sem área não recebe bloco ou totais por UI/API; conteúdo externo não executa script.
- [ ] **CA-P5:** responsável designado realiza roteiro integrado com comparação de amostra; cinco SPECs possuem provas e aceite, sem declarar implementação só pelo pacote documental.

## TDD da SPEC

| Etapa | Prova / ação | Resultado esperado | Evidência |
|---|---|---|---|
| RED | Testes de filtros/totais, falha e acesso antes do painel | Reprova P1–P4 | Relatório RED |
| GREEN | Massa: estoque P1 10 UN/local A, P2 2 KG/local B; OP-1 aberta; compra C-1 aberta; OM-11 e OM-L1 elegíveis | Estoque separado por unidade; uma OP, uma compra, dois pedidos oficiais; NS-10 intenção e NS-12 aguardando vínculo separados | Tela + consultas esperadas |
| REFACTOR/REGRESSÃO | Filtrar P1/data; falhar Omie; negar pedidos; mudar status Nuvemshop; dado externo com HTML; reset de sessão | Totais coerentes; origem/último sucesso; sem bloco proibido/script/cache de outra pessoa | QA e roteiro humano |

**Fixtures:** lotes das SPECs anteriores; um vazio completo, um recurso sem lote, um lote antigo após erro e perfil com painel/compras apenas. Adicionar compra sem data prevista: não classificá-la atrasada.
**Erros obrigatórios:** intervalo invertido, filtro inválido, erro de fonte, acesso negado, status sem mapeamento, pedido sem referência, valores null e sessão trocada.
**Comandos/evidência:** runner existente e QA nativo Skip; resultado dos testes e comparação real mascarada em 05_entregas/fase-1/spec-1-005/. Não gravar transcrição privada, segredo ou dados pessoais desnecessários.

### Preflight e execução reproduzível dos testes

Antes do RED, inspecionar package.json, scripts e diretório de testes do projeto Skip pelo MCP, identificar o runner e registrar seu comando exato e versão na evidência. Criar os testes desta SPEC em tests/pcp/spec-1-005.test.mjs (ou arquivo equivalente do runner já instalado) e a massa sintética em tests/pcp/fixtures/. Não modificar o cliente PocketBase gerado para facilitar teste.

Se não houver runner, o harness mínimo autorizado é node:test, sem nova dependência. Verificar node --version no ambiente de build/QA; executar node --test tests/pcp/spec-1-005.test.mjs. Normalização/cálculo usa fixtures; autorização e rotas exigem teste de integração contra backend de homologação, com URL e tokens de teste em variáveis do ambiente, nunca em código/relatório. Se Node ou backend/contas autorizadas não estiverem disponíveis, parar o recorte e registrar a dependência técnica, sem declarar prova concluída.

RED só é válido quando o teste executa e falha pela ausência do comportamento esperado (assertion/resultado incorreto); erro de ambiente, login inválido não planejado ou comando inexistente não comprova RED. GREEN requer os cenários obrigatórios, incluindo chamadas API diretas e falhas. QA nativo do Skip é adicional, não substituto desses testes.

## Teste humano do cliente

**Origem:** gate de execução por task; CL-005 é pré-condição de aprovação documental.
Responsável designado: entrar; localizar item/OP/compra/pedido conhecidos; filtrar; conferir origem/horário; distinguir pedido não pago; observar falha com lote antigo; trocar perfil e confirmar limite. Esperado: visão única dos dados permitidos, sem decisão automática e com pendência clara. Registrar mensagem explícita de aceite ou demonstração acompanhada.

## Handoff e operação

Mostrar o painel no início da rotina. Atualizar fontes somente com papel técnico aprovado; reportar pendência ao responsável conhecido. A próxima fase não é iniciada automaticamente pela conclusão da tela; passagem exige tasks, evidência e teste humano da fase.

## Tasks vinculadas

| ID | Task | Critério | Prova / recorte | Pré-condição | Evidência esperada |
|---|---|---|---|---|---|
| ee794334-224f-4066-9d75-8c42e7fc2306 | Publicar o painel diário por área | CA-P1, CA-P2 | Montar a visão diária no Skip com estoque, produção, compras e pedidos; aplicar filtros e permissões às linhas e totais. | Pré-condições desta SPEC | 05_entregas/fase-1/spec-1-005/; fase 1 + título exato |
| ca5ece04-40ed-4c93-8fa4-1e0875505fbe | Mostrar atualização e falhas em cada bloco | CA-P3, CA-P4 | Exibir fonte, último sucesso, falha e ausência de dado; preservar snapshots e distinguir zero válido, indisponível e lote antigo. | Task anterior e teste humano confirmados | 05_entregas/fase-1/spec-1-005/; fase 1 + título exato |
| 0b045738-b6a1-4188-8f22-9bc230fa2cd3 | Validar o painel com a equipe | CA-P1–P5 | Executar a demonstração integrada e regressão da Fase 1, comparar amostras autorizadas e registrar aceite humano sem marcar tasks por silêncio. | Task anterior e teste humano confirmados | 05_entregas/fase-1/spec-1-005/; fase 1 + título exato |

## Emendas

Nenhuma emenda aprovada até esta revisão.
