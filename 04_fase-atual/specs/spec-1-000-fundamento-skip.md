# SPEC-1-000 — Fundamento da plataforma antes das conexões

**Fase:** 1. **Status:** planejada; implementação e testes pendentes.  
**Dono do aceite:** responsável designado pelo cliente, a confirmar.  
**Origem:** RQ-001/007/012, P2/P3.  
**Degrau da solução:** recurso nativo e construção mínima no Skip/Skip Cloud — criar a base demonstrável antes de integrar fontes.

## Contexto e decisões fechadas

O consultor definiu Skip, MCP do Skip e Skip Cloud. Também definiu a sequência obrigatória: primeiro construir o fundamento, depois realizar as conexões. Esta é a primeira SPEC e suas três tasks antecedem as levas de acesso e integração.

Usar o projeto conectado do executor, confirmando sua identidade. A falta de credenciais Omie/Nuvemshop não bloqueia este fundamento, pois sua demonstração usa somente massa sintética identificada.

## Resultado observável

A base da plataforma abre na prévia do projeto Skip, navega entre Catálogo e Painel e mostra estoque, produção, compras e pedidos com dados de demonstração. O contrato interno e as coleções estão preparados; nenhuma fonte externa foi conectada ou declarada integrada.

## Limites e dependências

- Inclui estrutura nativa, contratos de dados, navegação, componentes e estados vazio/erro da prévia.
- Exclui conexão ERP/canal, secrets externos, uso de dados reais, cálculo de negócio novo, publicação pública e aceite da integração.
- Entrada: acesso do executor ao projeto Skip existente; não precisa CL-001/002 para executar.
- Saídas: base no Skip; 07-sistemas/pcp/fundamento.md com projeto e contrato sem segredo; prova em 05_entregas/fase-1/spec-1-000/.
- Superfícies: migrations, serviços frontend e páginas do projeto. Não criar banco/hospedagem externa.
- Atores: executor na prévia autorizada e responsável pelo teste humano. Não conceder papel real por hipótese.
- Rollback: reverter componentes/migration ainda sem dados reais, preservando recursos anteriores do projeto.
- Plano B: se projeto não é inequívoco, parar antes de criar outro.

## Dados e integrações

Construir no Skip Cloud o modelo base pcp_execucoes, pcp_lotes, pcp_dados e pcp_fontes, com campos, chaves, geração e lease descritos no contrato de dados da SPEC-1-002 disponível neste mesmo pacote. Esse contrato define a estrutura; executar nesta SPEC apenas a criação/reuso da estrutura, sem adapter, chamada remota ou sincronização. A SPEC-1-002 reutiliza essas coleções depois. pcp_perfis e suas concessões ficam na SPEC-1-001.

Todas as coleções brutas têm as cinco regras declaradas e acesso direto de cliente negado. Usar migrations com up/down, ordinal livre e campos created/updated; inspecionar schema/migrations antes de criar para não duplicar recursos.

Criar serviços internos com interface de leitura estável e provider de demonstração explícito. Não usar dados de demonstração como lote ativo de produção. Fixtures do provider ficam isoladas no código/ambiente de homologação; ao trocar para provider real, não mesclar os conjuntos. O provider real será implementado nas SPECs de conexão.

## Fluxo e regras

1. Identificar projeto, inspecionar base existente e recursos nativos; reutilizar antes de criar.
2. Criar/reusar coleções e interfaces internas, sem tocar dados oficiais ou cadastrar secret externo.
3. Montar navegação e telas de demonstração. Banner permanente: Dados de demonstração — fontes ainda não conectadas.
4. Usar fixture: estoque P1=10 UN/local A e P2=2 KG/local B; OP-1 aberta; compra C-1 aberta; pedidos oficiais fictícios OM-11/OM-L1 e intenção NS-10 separada.
5. Mostrar vazio, indisponível e falha como estados diferentes. Não prometer dado atualizado do Omie nesta etapa.
6. Validar contrato de leitura, navegação e ausência de chamadas externas. Somente depois do fundamento aceito, executar a leva de acesso e então as conexões reais.
7. A integração completa e a liberação com dados reais continuam sendo aceite da SPEC-1-005.

## Instruções de execução para o Ethos

1. Ler esta SPEC e o contrato de modelo da spec-1-002-leitura-omie.md; inspecionar projeto/schema/migrations/guias pelo MCP do Skip.
2. Construir somente o fundamento no Skip/Skip Cloud; criar telas na prévia e massa sintética identificada, com acesso bruto negado.
3. Não testar APIs Omie/Nuvemshop, não provisionar conectores nem carregar dados reais durante esta leva.
4. Implementar interface de provider substituível: demonstração agora, real após aceite das SPECs de conexão.
5. Rodar os cenários e QA nativo; demonstrar ao responsável. Parar diante de acesso ambíguo ao projeto ou recurso existente incompatível.
6. Uma task por vez. Só liberar a próxima leva depois de prova e confirmação explícita do teste humano do fundamento.

## Checklist de execução

- [ ] Projeto existente identificado e recursos reutilizados.
- [ ] Estrutura nativa e regras de acesso inspecionadas.
- [ ] Telas e navegação demonstráveis com banner permanente.
- [ ] Nenhuma chamada externa ou dado real usado.
- [ ] Provas e teste humano do fundamento registrados.

## Critérios de aceite

- [ ] **CA-F1:** base nativa corresponde ao contrato interno e não duplica coleção/migration existente.
- [ ] **CA-F2:** navegação e quatro blocos do painel/catalogo abrem com as fixtures e indicação inequívoca de demonstração.
- [ ] **CA-F3:** vazio, erro e ausência são distintos; fixture não é publicada como snapshot real e não existe chamada a Omie/Nuvemshop.
- [ ] **CA-F4:** contrato de provider permite substituir fixture por fonte real posteriormente; QA e teste humano do fundamento registrados antes de conexão.

## TDD da SPEC

| Etapa | Prova / ação | Resultado esperado | Evidência |
|---|---|---|---|
| RED | Antes da base, teste de contrato/provider e navegação | Falha pela ausência dos componentes esperados | Relatório RED |
| GREEN | Abrir prévia, catálogo e quatro blocos com fixture | Base e navegação funcionam; banner visível | QA + captura da prévia |
| REFACTOR/REGRESSÃO | Provider vazio/erro; observar requisições; inspecionar lotes ativos | Estados explícitos; zero chamadas externas e zero fixture ativa real | Relatório de rede/contrato sanitizado |

**Preflight:** inspecionar scripts de teste do projeto. Reusar runner e registrar comando; sem runner, harness mínimo autorizado node:test, comando node --test tests/pcp/spec-1-000.test.mjs. Confirmar Node no ambiente de build; se indisponível, parar o teste técnico e não aceitar RED por falha de ambiente. Teste visual usa prévia autorizada; não publicar publicamente para demonstrar.
**Fixtures:** massa sintética descrita acima; provider com retorno vazio e erro. Nenhuma credencial ou dado pessoal.
**Evidência:** 05_entregas/fase-1/spec-1-000/; demonstração de base, contrato e ausência de chamadas externas.

## Teste humano do cliente

Responsável designado navega na prévia, reconhece as telas e o rótulo de demonstração, verifica erro/vazio e confirma o fundamento. Não é aceite da integração real. Guardar confirmação explícita antes de liberar conexões.

## Handoff e operação

A próxima leva protege acesso por área. Depois entram leitura Omie/Nuvemshop e catálogo real; por fim, o painel integrado. As telas são reaproveitadas, sem reconstruir a base ou apresentar mock como sistema integrado.

## Tasks vinculadas

| ID | Task | Critério | Prova / recorte | Evidência |
|---|---|---|---|---|
| id pendente | Criar a base do sistema no Skip | CA-F1 | Reutilizar o projeto Skip conectado, criar as coleções nativas e o contrato interno da aplicação, sem chamada a ERP ou canal externo. | 05_entregas/fase-1/spec-1-000/; fase 1 + título exato |
| id pendente | Montar as telas com dados de demonstração | CA-F2, CA-F3 | Construir navegação, catálogo e os quatro blocos do painel com fixtures sintéticas e aviso permanente de demonstração. | 05_entregas/fase-1/spec-1-000/; fase 1 + título exato |
| id pendente | Conferir o fundamento antes das conexões | CA-F1–F4 | Provar navegação, contratos internos, estados vazio/erro e isolamento das fixtures; liberar as próximas levas somente após teste humano explícito. | 05_entregas/fase-1/spec-1-000/; fase 1 + título exato |

## Emendas

Nenhuma emenda adicional.
