# SPEC-3-009 — Pedido pronto para faturar: frete, volumes, fila, pedidos manuais e envio ao Omie

**Fase:** 3  
**Status:** planejada  
**Dono:** American Goodies (faturamento e expedição) com o Maestro; conferência na validação final  
**Origem no escopo:** antiga fase 3 (frete e volumes; fila apto/bloqueado para faturamento e exceções manuais; regras "FOB observado não é universalizado", "volumes são conferidos fisicamente, sem cubagem inventada", "pedido manual não duplica integrado"); fluxo-alvo 12; RQ-005/011/012; CL-PEND-010; CL-PEND-011  
**Degrau da solução:** construção mínima sobre a SPEC-3-008; a escrita no Omie fica atrás da chave `omie_pedido_venda_escrita`.

## Contexto e decisões fechadas

- **Estado atual:** o faturamento prepara os pedidos fora do sistema; frete e volumes são combinados à mão; pedidos manuais (e-mail, WhatsApp) entram no Omie digitados e podem repetir um pedido que já veio integrado.
- **Estado desejado:** cada pedido tem modalidade de frete e volumes conferidos pela expedição; a fila mostra o que está apto e o que está bloqueado, com o motivo; pedido manual entra marcado e passa pela checagem de duplicata; o pedido liberado pode ser gravado no Omie (pedido manual e volumes e frete), atrás da chave.
- **Decisões já fechadas:**
  - Sem modalidade de frete padrão: FOB visto num pedido não vale para os outros.
  - Volumes só por contagem da expedição; sem cálculo de cubagem.
  - Duplicata só por referência comprovada (código de integração, número do canal); pedido parecido (mesmo cliente, data e itens) vai para revisão; nunca juntar por cliente e valor.
  - Nota fiscal continua sendo emitida por uma pessoa no Omie; o sistema não emite nem transmite nota.
  - Qualquer mudança depois da liberação desfaz a liberação.
- **Condição para ligar:** autorização explícita do dono, unidades, tabela e frete confirmados e contrato de gravação do pedido conferido (checklist CL-PEND-011).
- **Bloqueios:** nenhum para construir.

## Resultado observável

Em `/pedidos/preparacao`, cada pedido mostra frete, volumes, unidade, tabela e origem, e um selo "apto" ou "bloqueado: motivo". O botão "liberar para faturar" só aparece para quem tem a ação e só no apto. Pedido manual aparece com a marca "manual" e o motivo; possível duplicata aparece em "a revisar". Com a chave desligada, a tela mostra o que lançar no Omie; no simulador, com a chave ligada, mostra "gravado e conferido".

## Limites e dependências

- **Inclui:** modalidade de frete por pedido; volumes conferidos; fila apto/bloqueado; liberação com registro; pedido manual; checagem de duplicata; adapter de gravação atrás da chave; simulador.
- **Fora de escopo:** emitir ou transmitir nota fiscal; calcular frete ou cubagem; roteirização; cobrança.
- **Entradas e pré-condições:** SPEC-3-008 (unidades, tabela, origem); contrato de inclusão e alteração do pedido de venda registrado em `07-sistemas/pcp/contratos-fase-3.md` a partir da documentação oficial de `produtos/pedido/`, conferido por leitura antes do adapter.
- **Saídas/artefatos:** coleções `pcp_preparacao_pedido`, `pcp_volumes`, `pcp_pedidos_manuais`, `pcp_liberacoes_faturamento`; adapter; evidências em `05_entregas/fase-3/spec-3-009/`.
- **Dependências e responsáveis:** dono autoriza ligar a chave; faturamento informa as regras de frete das unidades (CL-PEND-010); expedição conta volumes; Maestro constrói.
- **Atores e permissões mínimas:** `preparar_pedido` (frete, manual), `conferir_volumes` (expedição), `liberar_faturamento`, `autorizar_escrita_omie` (dono).
- **Superfícies/arquivos/configurações afetadas:** `/pedidos/preparacao`, `/pedidos/manuais`, configuração das chaves.
- **Risco e plano B:** se a gravação pela API não for aceita, a chave fica desligada e o faturamento lança à mão com os dados da tela; a leitura seguinte liga o pedido.
- **Rollback ou reversão:** desligar a chave volta ao lançamento manual; pedido gravado no Omie exige decisão humana.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Preparação | Skip Cloud | Pedido, modalidade de frete, transportadora (se houver), volumes, peso (se pesado), conferido por, hora, estado (bloqueado, apto, liberado) e motivos | `preparar_pedido`, `conferir_volumes`, `liberar_faturamento` | Versão esperada; hash do conteúdo liberado | Mudança depois da liberação: liberação desfeita |
| Pedido manual | Skip Cloud | Cliente, unidade, itens, origem "manual", motivo, referência informada | `preparar_pedido` | Checagem de duplicata antes de criar ou liberar | Duplicata comprovada: bloqueado; parecido: "a revisar" |
| Sistema → Omie (pedido de venda) | Omie | Inclusão do pedido manual com código de integração; volumes e frete do pedido liberado; campos exatos da documentação registrados no contrato | Segredo no backend; chave ligada | Código de integração persistido antes; consulta antes de repetir | Timeout: "resultado incerto" e consulta; recusa: "falhou sem efeito" |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Sem modalidade de frete | Bloqueado: "frete não definido" | — | Escopo |
| RN-02 | Volumes não conferidos pela expedição | Bloqueado: "volumes não conferidos" | — | Escopo |
| RN-03 | Apto | Unidade, tabela sem diferença aberta, frete, volumes e origem conferidos; sem duplicata | — | Escopo, fluxo-alvo 12 |
| RN-04 | Mesma referência de outro pedido | Duplicata: bloqueado | — | RQ-005 |
| RN-05 | Mesmo cliente, data e itens, sem referência | "Possível duplicata": a revisar | Faturamento decide com motivo | RQ-005 |
| RN-06 | Chave desligada | 423; zero chamadas | — | AC-26-01 |

## Fluxo e regras

1. O faturamento define o frete; a expedição conta e registra os volumes.
2. O sistema calcula apto ou bloqueado e mostra os motivos.
3. Pedido manual é registrado com motivo e passa pela checagem de duplicata.
4. Quem tem a ação libera o apto para faturar.
5. Com a chave ligada (simulador na construção), o sistema grava no Omie uma vez e confere; desligada, a tela mostra o que lançar.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | Pedido integrado com frete CIF e 12 volumes conferidos | Apto; liberado; volumes e frete gravados no simulador uma vez | — |
| Limite | Pedido manual com mesmo cliente, data e itens de um integrado | "Possível duplicata", a revisar | Faturamento decide |
| Falha | Volumes alterados depois da liberação | Liberação desfeita; volta para apto ou bloqueado | Nova liberação |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC; o índice da fase 3 (regra 6); SPEC-3-008; o código de pedidos no Skip.
2. **Alterar somente:** preparação, volumes, pedidos manuais, liberação, adapter, chave e simulador.
3. **Não alterar:** classificação de origem da fase 1; unidades e tabela (SPEC-3-008).
4. **Executar nesta ordem:** frete e volumes; fila apto/bloqueado e liberação; pedido manual e duplicata; contrato e adapter com a chave desligada.
5. **Parar e pedir validação quando:** qualquer prova exigir gravar na conta real; isso só acontece com o dono.
6. **Estado válido ao parar:** chave desligada; preparação funcionando sem gravar.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. Esta SPEC não tem teste próprio: o cliente confere o resultado na validação final (SPEC-3-018). Ponto de aprovação antes disso: nenhum; a autorização do dono para gravar é trava de segurança, não teste.

## Checklist de execução

- [ ] Frete por pedido sem padrão; volumes conferidos pela expedição.
- [ ] Fila apto/bloqueado com motivos e liberação.
- [ ] Pedido manual e checagem de duplicata.
- [ ] Contrato registrado; chave desligada; simulador com gravação única.
- [ ] Evidências em `05_entregas/fase-3/spec-3-009/`.

## Critérios de aceite

- [ ] **CA-3-26:** cada pedido tem a modalidade de frete escolhida, sem padrão para todos, e os volumes contados pela expedição; sem um dos dois o pedido fica bloqueado com o motivo; não há cálculo de cubagem.
- [ ] **CA-3-27:** só fica apto o pedido com unidade, tabela, frete, volumes e origem conferidos e sem duplicata; bloqueado mostra o motivo; só quem tem `liberar_faturamento` libera, com autor e hora; mudança depois da liberação a desfaz.
- [ ] **CA-3-28:** pedido manual entra marcado com motivo; antes de criar ou liberar, a mesma referência bloqueia como duplicata e pedido parecido vai para revisão; nunca há junção por cliente e valor.
- [ ] **CA-3-29:** com a chave desligada a rota responde 423 e a tela mostra o que lançar; no simulador, com a chave ligada, o pedido manual e os volumes e o frete do pedido liberado são gravados uma vez e conferidos, mesmo com resposta perdida; nenhuma nota fiscal é emitida pelo sistema.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | P3.09-01: pedido sem frete e sem volumes | `node --test tests/pcp/spec-3-009.test.mjs` | Bloqueado com os dois motivos | `05_entregas/fase-3/spec-3-009/` |
| RED | P3.09-02: manual com a mesma referência de um integrado | Fixture | Duplicata bloqueada | Idem |
| RED | P3.09-03: gravação com a chave desligada | Rota | 423; zero chamadas | Idem |
| GREEN | P3.09-04: CIF, 12 volumes, liberado | Fixture e simulador | Apto, liberado, gravado uma vez | Idem |
| GREEN | P3.09-05: manual parecido sem referência | Fixture | "Possível duplicata" | Idem |
| REFACTOR/REGRESSÃO | P3.09-06: volumes alterados depois da liberação; provas da SPEC-3-008 | Fixture e testes | Liberação desfeita; verdes | Idem |

**Dados/fixtures:** pedidos integrados e manuais de demonstração; simulador do Omie com recusa e resposta perdida.  
**Caminhos de erro obrigatórios:** sem frete, sem volumes, duplicata, possível duplicata, mudança depois da liberação, chave desligada, timeout, recusa.  
**Evidência exigida:** saída dos testes e registros do simulador.

## Teste humano do cliente

Esta SPEC não tem teste próprio. O cliente confere os pontos abaixo na sessão de validação final (SPEC-3-018); até lá, as tasks fecham pelas provas automáticas.

- **Origem:** CL-007 (sessão de validação final) e CL-PEND-011 (autorização do dono)
- **Quem confere:** faturamento, expedição e dono
- **O que confere:** a expedição conta os volumes de um pedido real; o pedido fica apto e é liberado; um pedido manual repetido é barrado; com a autorização do dono, volumes e frete são gravados no Omie uma vez (ou lançados à mão, se ele não autorizar).
- **Resultado esperado:** só o pedido completo fica apto; nenhuma duplicata; uma gravação no Omie.
- **Evidência do aceite:** o aceite da validação final (SPEC-3-018).

## Handoff e operação

- **Como demonstrar:** a fila com um apto e um bloqueado, e a liberação.
- **Como operar depois:** expedição conta volumes; faturamento libera e emite a nota no Omie.
- **Como monitorar:** pedidos bloqueados há mais tempo, possíveis duplicatas e gravações em "resultado incerto".
- **Pendência conhecida:** regras de frete das unidades (CL-PEND-010) e autorização do dono (CL-PEND-011).

## Tasks vinculadas

Os ids vêm do portal na primeira sincronização (`pendente` até lá). Status e prazo ficam só no `fase.md`.

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| pendente | Registrar o frete e os volumes conferidos pela expedição | American Goodies | SPEC-3-009 | CA-3-26 | P3.09-01 | 05_entregas/fase-3/spec-3-009/ | — | ☐ |
| pendente | Montar a fila de pedidos aptos e bloqueados para faturar | American Goodies | SPEC-3-009 | CA-3-27 | P3.09-04, P3.09-06 | 05_entregas/fase-3/spec-3-009/ | — | ☐ |
| pendente | Separar os pedidos manuais e impedir duplicata com pedido integrado | American Goodies | SPEC-3-009 | CA-3-28 | P3.09-02, P3.09-05 | 05_entregas/fase-3/spec-3-009/ | — | ☐ |
| pendente | Preparar o envio do pedido apto ao Omie, com o envio desligado | American Goodies | SPEC-3-009 | CA-3-29 | P3.09-03 | 05_entregas/fase-3/spec-3-009/ | — | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
