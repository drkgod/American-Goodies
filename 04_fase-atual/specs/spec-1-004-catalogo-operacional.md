# SPEC-1-004 — Catálogo de produtos, unidades e fichas

**Fase:** 1  
**Status:** planejada; implementação e testes ainda não executados.  
**Dono do aceite:** responsável designado pelo cliente, a confirmar.  
**Origem:** RQ-003 / RQ-008 / RQ-009 / RQ-012 / P1  
**Degrau da solução:** recurso nativo da plataforma e construção mínima — reutilizar Skip, MCP do Skip e Skip Cloud aprovados; adaptar somente o necessário ao fluxo.

## Contexto e decisões fechadas

Produtos e fichas estão no Omie. Nuvemshop recebe estoque do Omie e não é mestre de saldo. O catálogo de leitura deve tornar visíveis os registros oficiais que o PCP usará, sem corrigir receita ou criar produto nesta fase.

Ambiente: recursos nativos Skip/Skip Cloud via MCP. **Pré-condições:** SPEC-1-001 e recursos produtos/unidades/fichas da SPEC-1-002. Se ficha/local não for exposto pela API autorizada, mostrar a indisponibilidade; não reconstruir com planilha sem mudança aprovada.

## Resultado observável

Usuário com área catalogo consulta produto e seus componentes/unidades, entende qual dado está disponível e identifica uma ficha ausente sem que o sistema invente receita ou estoque.

## Limites e dependências

- Inclui consulta/busca por código/descrição, ativo/inativo, unidade, família quando exposta, ficha e locais.
- Exclui edição/cadastro de mestre, conversão não confirmada, cálculo de programação/consumo/perda e parâmetros de reposição.
- Entradas: snapshots completos do Omie com ID, unidade e ficha normalizados.
- Saídas: página Catálogo e detalhe; 07-sistemas/pcp/catalogo.md; provas em 05_entregas/fase-1/spec-1-004/.
- Atores: papel autorizado de catálogo; acesso a saldo adicional exige estoque. Possuir catálogo não concede estoque.
- Superfícies: src/services/pcp-catalogo.ts, página e endpoint GET /backend/v1/pcp/catalogo.
- Rollback: reverter página/serviço e manter snapshots; nenhuma escrita no ERP.
- Risco/plano B: sem dado, lista limitada com pendência identificada; nunca aceitar ficha mock como real.

## Dados e integrações

Usar pcp_fontes/pcp_lotes/pcp_dados da SPEC-1-002, sem criar cópia editável dos produtos. Chave do item é aplicativo_ref+produto_id; código/descrição não são identidade única. Saldo só aparece com área estoque.

Ficha: produto_id, unidade do produto e lista componente_id/insumo_id, quantidade e unidade do componente. Se a fonte trouxer versão/validade, mostrar; caso contrário registrar fingerprint técnico da leitura, sem alegar versão de receita oficial. Registrar horário do lote de produtos e ficha separadamente quando distintos.

| Regra | Condição | Resultado | Exceção |
|---|---|---|---|
| C1 | Produto existe em lote ativo | Exibir oficial por ID e descrição | Código igual não mescla produtos |
| C2 | Ficha exposta e unidade reconhecida | Exibir quantidades como informadas | Não corrigir rendimento |
| C3 | Unidade/ficha ausente | Marcar dado ausente e impedir cálculo futuro daquele item | Não preencher UN por padrão |
| C4 | Produto inativo ou some da janela | Preservar referência e distinguir inatividade de ausência de leitura | Não apagar histórico |
| C5 | Cliente tenta editar cadastro | Não há operação de escrita na F1 | Cadastro antecipado será outra entrega |

## Fluxo e regras

1. Buscar catálogo com filtro parametrizado e paginação; não concatenar entrada em expressão de filtro.
2. Exibir ID/código/descrição/unidade/ativo e origem/horário.
3. Abrir detalhe e ficha; dado ausente gera mensagem específica, não receita vazia com valor zero.
4. Locais/saldos só aparecem mediante autorização estoque; quantidades são mostradas por local/unidade, sem somar KG com UN.
5. Mudança de lote reflete versão lida; produtos fora da janela parcial não viram inativos automaticamente.
6. Ficha com insumo sem correspondência fica incompleta, preservando a referência de origem.
7. Manter modo de teste explicitamente rotulado; fixture não substitui mestre do Omie.

## Instruções de execução para o Ethos

1. Ler esta SPEC e spec-1-002-leitura-omie.md; inspecionar schema/serviços no projeto Skip pelo MCP.
2. Construir consulta e UI nativa sobre snapshots, sem nova autoridade de produto. Serviços frontend acessam rotas autenticadas Skip Cloud.
3. Aplicar área catalogo no servidor e, separadamente, área estoque para saldos; declarar regras em coleções.
4. Implementar filtros/busca/paginação e mensagens de ausência; não criar regra de conversão ou saneamento.
5. Rodar os cenários e QA; parar se unidade/ficha não tiver contrato comprovado. Registrar a lacuna sem modificar o Omie.
6. Ao parar, catálogo disponível continua consultável e item pendente permanece identificado. Uma task e seu teste humano por vez.

## Checklist de execução

- [ ] Fonte e lotes ativos registrados.
- [ ] Produto identificado por ID; busca/paginação sem duplicação.
- [ ] Ficha/unidade ausente explicitada.
- [ ] Saldo separado por local/unidade e autorização.
- [ ] Amostra, QA e aceite registrados.

## Critérios de aceite

- [ ] **CA-C1:** lista/detalhe correspondem ao ID/código/unidade/ativo do Omie, com fonte/horário.
- [ ] **CA-C2:** ficha mostra componentes e quantidades de origem; não inventa versão/rendimento/conversão.
- [ ] **CA-C3:** ficha/unidade/insumo ausente ou inativo gera estado explícito; dados não viram zero/default e consulta não altera mestre.
- [ ] **CA-C4:** busca/paginação/repetição não duplica; usuário de catálogo sem estoque não obtém saldo por UI ou API.

## TDD da SPEC

| Etapa | Prova / ação | Resultado esperado | Evidência |
|---|---|---|---|
| RED | Teste de lista/detalhe/ficha ausente e permissão antes da página | Reprova C1–C4 | Relatório RED |
| GREEN | Produto COOKIE-1 UN com ficha INS-1=0,05 KG; consultar lista e detalhe | Unidades e quantidade preservadas, sem conversão; fonte/horário | Captura + resposta sanitizada |
| REFACTOR/REGRESSÃO | Produto com mesmo código e ID distinto; ficha ausente; inativação; usuário sem estoque; ID longo e replay | Sem merge indevido, default ou vazamento; lote novo refletido | QA + comparação |

**Fixtures:** P1 UN; INS-1 KG; P2 com ficha null; P3 inativo; P4 unidade null; P5 mesmo código P1, ID distinto; ID longo em texto; estoque P1 em dois locais. Quantidades fictícias não são receita real.
**Erros obrigatórios:** filtro inválido, unidade desconhecida, fonte de ficha indisponível, insumo órfão, permissão negada e paginação.
**Comandos/evidência:** runner existente + QA nativo; comparar uma ficha autorizada com Omie e registrar em 05_entregas/fase-1/spec-1-004/.

### Preflight e execução reproduzível dos testes

Antes do RED, inspecionar package.json, scripts e diretório de testes do projeto Skip pelo MCP, identificar o runner e registrar seu comando exato e versão na evidência. Criar os testes desta SPEC em tests/pcp/spec-1-004.test.mjs (ou arquivo equivalente do runner já instalado) e a massa sintética em tests/pcp/fixtures/. Não modificar o cliente PocketBase gerado para facilitar teste.

Se não houver runner, o harness mínimo autorizado é node:test, sem nova dependência. Verificar node --version no ambiente de build/QA; executar node --test tests/pcp/spec-1-004.test.mjs. Normalização/cálculo usa fixtures; autorização e rotas exigem teste de integração contra backend de homologação, com URL e tokens de teste em variáveis do ambiente, nunca em código/relatório. Se Node ou backend/contas autorizadas não estiverem disponíveis, parar o recorte e registrar a dependência técnica, sem declarar prova concluída.

RED só é válido quando o teste executa e falha pela ausência do comportamento esperado (assertion/resultado incorreto); erro de ambiente, login inválido não planejado ou comando inexistente não comprova RED. GREEN requer os cenários obrigatórios, incluindo chamadas API diretas e falhas. QA nativo do Skip é adicional, não substituto desses testes.

## Teste humano do cliente

**Origem:** gate de execução.
PCP designado localiza produto/ficha conhecidos, compara unidade e componentes, abre item sem ficha e verifica a pendência. Demonstra que conta sem estoque não vê saldo. Aceite explícito após a prova.

## Handoff e operação

Catalogo é espelho consultivo; alteração real de produto/receita segue o responsável no Omie. Mostrar campo indisponível e contato humano de regularização somente se confirmado. Qualidade física e validação de receita continuam com o cliente.

## Tasks vinculadas

| ID | Task | Critério | Prova / recorte | Pré-condição | Evidência esperada |
|---|---|---|---|---|---|
| 8352cecc-0dee-41d0-a445-5751127dbe55 | Exibir catálogo e fichas técnicas do Omie | CA-C1, CA-C2 | Exibir produtos, unidade oficial, local e ficha técnica importados, com origem/horário e sem editar o mestre. | Pré-condições desta SPEC | 05_entregas/fase-1/spec-1-004/; fase 1 + título exato |
| ece1553b-6cd1-4cb6-8030-840353c172a5 | Sinalizar cadastros e unidades incompletos | CA-C3 | Diferenciar produto inativo, ficha ausente e unidade incompatível; preservar dados e impedir conversão/cálculo inventados. | Task anterior e teste humano confirmados | 05_entregas/fase-1/spec-1-004/; fase 1 + título exato |
| 0113090a-8cf4-419e-bcc7-1b7b2986d1ce | Conferir a atualização do catálogo | CA-C1–C4 | Comparar amostra com Omie, repetir lote e testar desativação/ficha ausente/ID longo; registrar prova e obter validação humana. | Task anterior e teste humano confirmados | 05_entregas/fase-1/spec-1-004/; fase 1 + título exato |

## Emendas

Nenhuma emenda aprovada até esta revisão.
