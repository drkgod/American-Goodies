# SPEC-3-011 — Tratamento dos alertas: ciclo, responsável, histórico e destinatário por área

**Fase:** 3  
**Status:** planejada  
**Dono:** American Goodies (PCP, Compras e faturamento) com o Maestro; conferência na validação final  
**Origem no escopo:** antiga fase 4 (agrupamento e ciclo aberto/em análise/tratado; responsável e histórico; regras "desativar regra preserva histórico" e "destinatário depende dos papéis aprovados"; "tratamento exige registro humano"); fluxo-alvo 13 (alertas e histórico por área); RQ-007/013; CL-003  
**Degrau da solução:** construção mínima sobre os alertas da SPEC-3-010 e a matriz de acesso.

## Contexto e decisões fechadas

- **Estado atual:** depois da SPEC-3-010, os alertas existem, mas ninguém os trata e todos veem tudo.
- **Estado desejado:** cada alerta passa por aberto, em análise e tratado; tratar exige registrar a ação e quem tratou; cada área vê só os seus alertas, agrupados; desligar uma regra guarda o histórico.
- **Decisões já fechadas:**
  - Ações de tratamento: compra solicitada, ordem reprogramada, fornecedor contatado, pedido liberado, risco aceito, alerta indevido (com motivo) e outra (com texto).
  - Destinatário por área: estoque e produção para o PCP; compra e preço para Compras; pedido para o faturamento; divergência para o PCP; a gestão vê todos se a matriz der. Quem recebe depende da matriz aprovada (CL-003).
  - O aviso é dentro da plataforma (contador e lista por área); não há envio por WhatsApp ou e-mail.
  - Histórico não é apagado; alerta que volta depois de tratado é ligado ao anterior.
- **Bloqueios:** nenhum para construir.

## Resultado observável

O menu mostra o número de alertas abertos da área de quem está logado. Em `/alertas`, a pessoa vê só os da sua área, agrupados por tipo e item, assume um alerta ("em análise") e o trata registrando a ação. O histórico mostra quem fez o quê e quando.

## Limites e dependências

- **Inclui:** estados do ciclo; responsável; registro da ação; histórico; reabertura ligada; destinatário por área; agrupamento; desligar regra preservando histórico; ação nova `tratar_alerta`.
- **Fora de escopo:** executar a ação tratada (comprar, reprogramar); aviso fora da plataforma; medir o loop (SPEC-3-013).
- **Entradas e pré-condições:** alertas da SPEC-3-010; matriz de acesso.
- **Saídas/artefatos:** campos de ciclo em `pcp_alertas`; coleção `pcp_alertas_historico`; telas; evidências em `05_entregas/fase-3/spec-3-011/`.
- **Dependências e responsáveis:** dono aprova quem recebe cada área na matriz (CL-003); Maestro constrói.
- **Atores e permissões mínimas:** `tratar_alerta` na área do alerta; consulta por área.
- **Superfícies/arquivos/configurações afetadas:** `/alertas`, menu, configuração das regras.
- **Risco e plano B:** sem a matriz aprovada, só perfis de teste recebem alertas; a construção segue.
- **Rollback ou reversão:** desligar o ciclo deixa os alertas só de leitura; histórico mantido.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Ciclo do alerta | Skip Cloud | Estado (aberto, em análise, tratado), responsável, ação, texto, autor, hora, alerta anterior | `tratar_alerta` na área | Versão esperada; mudança de estado em transação | Conflito: 409 |
| Histórico | Skip Cloud | Alerta, evento, autor, hora, valores | Servidor | Só inclusão | — |
| Regras | Skip Cloud | Regra, ativa, desligada por, hora | `editar_parametros` | — | Desligar não apaga alertas |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Tratar sem ação registrada | Recusado | — | Escopo |
| RN-02 | Alerta de outra área | Invisível e negado sem pistas | Gestão, se a matriz der | Escopo; CL-003 |
| RN-03 | Condição volta depois de tratado | Alerta novo ligado ao anterior | — | Decisão desta SPEC |
| RN-04 | Regra desligada | Para de gerar; histórico mantido | — | Escopo |
| RN-05 | Alertas do mesmo tipo e item | Agrupados na lista | — | Escopo |

## Fluxo e regras

1. A pessoa vê os alertas abertos da sua área, agrupados.
2. Assume um alerta; ele vai para "em análise" com ela como responsável.
3. Trata registrando a ação; o alerta vai para "tratado".
4. Se a condição voltar, nasce um alerta novo ligado ao anterior.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | Ruptura prevista; Compras assume e registra "compra solicitada" | Tratado com autor, hora e ação | — |
| Limite | Duas pessoas assumem ao mesmo tempo | Uma consegue; a outra recebe 409 | Recarregar |
| Falha | PCP tenta ver alerta de preço | Negado sem pistas | — |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC; o índice da fase 3; SPEC-3-010; a matriz de acesso no Skip.
2. **Alterar somente:** ciclo, histórico, destinatário, agrupamento e desligamento de regra.
3. **Não alterar:** as regras de cálculo (SPEC-3-010).
4. **Executar nesta ordem:** ciclo e histórico; destinatário por área e agrupamento.
5. **Parar e pedir validação quando:** nunca para construir.
6. **Estado válido ao parar:** alertas da SPEC-3-010 continuam sendo gerados.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. Esta SPEC não tem teste próprio: o cliente confere o resultado na validação final (SPEC-3-018). Ponto de aprovação antes disso: nenhum.

## Checklist de execução

- [ ] Estados, responsável e ação obrigatória.
- [ ] Histórico só de inclusão e reabertura ligada.
- [ ] Destinatário por área e agrupamento.
- [ ] Desligar regra preserva histórico.
- [ ] Evidências em `05_entregas/fase-3/spec-3-011/`.

## Critérios de aceite

- [ ] **CA-3-33:** cada alerta passa por aberto, em análise e tratado; tratar exige a ação registrada e grava autor e hora; o histórico não é apagado; condição que volta gera alerta novo ligado ao anterior.
- [ ] **CA-3-34:** cada pessoa vê e trata só os alertas da sua área, conforme a matriz, agrupados por tipo e item; alerta de outra área é negado sem pistas; desligar uma regra para de gerar alertas e guarda o histórico.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | P3.11-01: tratar sem ação | `node --test tests/pcp/spec-3-011.test.mjs` | Recusado | `05_entregas/fase-3/spec-3-011/` |
| RED | P3.11-02: perfil do PCP lê alerta de preço | Fixture | Negado sem pistas | Idem |
| GREEN | P3.11-03: ciclo completo de uma ruptura | Fixture | Tratado com autor, hora e ação | Idem |
| GREEN | P3.11-04: duas pessoas assumem juntas | Fixture | Uma consegue; outra 409 | Idem |
| REFACTOR/REGRESSÃO | P3.11-05: regra desligada; provas da SPEC-3-010 | Fixture e testes | Histórico mantido; verdes | Idem |

**Dados/fixtures:** perfis de teste de PCP, Compras e faturamento; alertas de demonstração.  
**Caminhos de erro obrigatórios:** sem ação, outra área, concorrência, regra desligada, reabertura.  
**Evidência exigida:** saída dos testes e captura das telas.

## Teste humano do cliente

Esta SPEC não tem teste próprio. O cliente confere os pontos abaixo na sessão de validação final (SPEC-3-018); até lá, as tasks fecham pelas provas automáticas.

- **Origem:** CL-007 (sessão de validação final)
- **Quem confere:** PCP, Compras e faturamento
- **O que confere:** cada um vê só os alertas da sua área e trata um, registrando a ação.
- **Resultado esperado:** tratamento registrado com autor e hora; nenhuma área vê o que não é dela.
- **Evidência do aceite:** o aceite da validação final (SPEC-3-018).

## Handoff e operação

- **Como demonstrar:** contador do menu e o ciclo de um alerta.
- **Como operar depois:** cada área trata os seus alertas no dia a dia.
- **Como monitorar:** alertas abertos há mais tempo por área.
- **Pendência conhecida:** quem recebe cada área na matriz (CL-003).

## Tasks vinculadas

Os ids vêm do portal na primeira sincronização (`pendente` até lá). Status e prazo ficam só no `fase.md`.

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| pendente | Abrir o ciclo de tratamento dos alertas com responsável e histórico | American Goodies | SPEC-3-011 | CA-3-33 | P3.11-01, P3.11-03, P3.11-04 | 05_entregas/fase-3/spec-3-011/ | — | ☐ |
| pendente | Mostrar cada alerta só para quem cuida da área, agrupado | American Goodies | SPEC-3-011 | CA-3-34 | P3.11-02, P3.11-05 | 05_entregas/fase-3/spec-3-011/ | — | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
