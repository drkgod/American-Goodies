# SPEC-3-016 — Exportação dos dados e recuperação demonstrada

**Fase:** 3  
**Status:** planejada  
**Dono:** American Goodies (gestão) com o Maestro; conferência na validação final  
**Origem no escopo:** antiga fase 5 (exportação dos dados complementares; recuperação demonstrada de integração e backup técnico no ambiente aprovado; "exportação e recuperação conferem contagens"); decisão 5 (portabilidade com exportação e identificação de propriedade do cliente); decisão P2 (portabilidade por exportação e recuperação da camada complementar); RQ-012  
**Degrau da solução:** nativo da plataforma — usa os recursos de backup e restauração do Skip Cloud, se existirem (conferir nos guias do Skip); senão, exportação completa e restauração num ambiente separado.

## Contexto e decisões fechadas

- **Estado atual:** a camada complementar (parâmetros, programação, apontamentos, conferências, aprovações, envios, compras, recebimentos, unidades, pedidos preparados, alertas, perguntas) existe só no Skip Cloud do projeto 62774. A recuperação das leituras do Omie e da Nuvemshop foi provada na fase 1 (último lote válido mantido, retomada sem duplicar).
- **Estado desejado:** a gestão exporta todos os dados complementares com um resumo de contagens; a cópia de segurança é restaurada num ambiente separado e as contagens batem; a recuperação das leituras do Omie e da Nuvemshop é provada de novo com os recursos da fase 3.
- **Decisões já fechadas:**
  - Exportação em CSV por coleção mais um resumo (coleção, quantidade de registros, data, versão do sistema), em pacote identificado como dados da American Goodies.
  - Exportação sem segredo, senha ou chave; contatos e dados de clientes vão no arquivo porque são do cliente, e o arquivo não vai para o Git.
  - Restauração só em ambiente separado (projeto de teste ou cópia), nunca por cima da produção.
  - Só quem tem `exportar_dados` exporta (gestão, pela matriz).
- **Bloqueios:** nenhum para construir.

## Resultado observável

Em `/exportacao`, a gestão baixa o pacote e vê o resumo com a quantidade de registros por coleção. O relatório de recuperação mostra a restauração no ambiente separado com as mesmas contagens e a retomada das leituras depois de uma falha simulada.

## Limites e dependências

- **Inclui:** exportação de todas as coleções complementares; resumo de contagens; restauração em ambiente separado; prova de recuperação das leituras; ação `exportar_dados`.
- **Fora de escopo:** migrar para outro backend; exportar dados do Omie (o Omie é a fonte e tem a própria exportação); restaurar por cima da produção.
- **Entradas e pré-condições:** coleções das fases 1 a 3; guia de backup do Skip.
- **Saídas/artefatos:** rota de exportação; relatório `05_entregas/fase-3/spec-3-016/recuperacao.md` (só contagens, sem dados); evidências.
- **Dependências e responsáveis:** dono aprova quem exporta (CL-003); Maestro constrói e prova.
- **Atores e permissões mínimas:** `exportar_dados`.
- **Superfícies/arquivos/configurações afetadas:** `/exportacao`; ambiente separado de restauração.
- **Risco e plano B:** sem backup nativo, restaurar a partir da exportação num projeto de teste e conferir as contagens.
- **Rollback ou reversão:** desligar a rota; o ambiente separado é descartado depois da prova.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Skip Cloud → pacote | Skip Cloud | Uma planilha CSV por coleção complementar e o resumo de contagens | `exportar_dados` | Exportação lida num instante consistente; repetir gera pacote novo | Coleção que falhar: pacote marcado incompleto |
| Cópia → ambiente separado | Skip Cloud | Backup nativo ou o pacote | Maestro | Restaurar num ambiente vazio | Contagem diferente: prova falha com a coleção |
| Omie e Nuvemshop → leituras | Omie e Nuvemshop | Rotinas existentes | Segredo no backend | Último lote válido; retomada pelo cursor | Falha simulada no simulador |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Pacote | Sem segredo, senha ou chave | — | Regras comuns, item 9 |
| RN-02 | Contagens do resumo × restauração | Têm de bater por coleção | — | Escopo, antiga fase 5 |
| RN-03 | Falha de leitura | Último lote válido mantido; retomada sem duplicar | — | Fase 1 |
| RN-04 | Restauração | Só em ambiente separado | — | Decisão desta SPEC |

## Fluxo e regras

1. Construir a exportação com o resumo de contagens.
2. Fazer a cópia de segurança e restaurar num ambiente separado; conferir as contagens.
3. Simular falha nas leituras do Omie e da Nuvemshop e provar a retomada.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | Exportação completa | Pacote com resumo; contagens batem com o sistema | — |
| Limite | Coleção vazia | Aparece no resumo com zero registros | — |
| Falha | Restauração com uma coleção faltando | Prova falha indicando a coleção | Refazer a cópia |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC; o índice da fase 3; os guias do Skip sobre backup e migrations; `07-sistemas/pcp/fundamento.md`.
2. **Alterar somente:** rota e tela de exportação; ambiente separado de restauração.
3. **Não alterar:** a produção durante a restauração; as rotinas de leitura.
4. **Executar nesta ordem:** exportação; cópia e restauração; recuperação das leituras.
5. **Parar e pedir validação quando:** a restauração exigir mexer na produção; não fazer.
6. **Estado válido ao parar:** produção intacta; ambiente separado descartável.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. Esta SPEC não tem teste próprio: o cliente confere o resultado na validação final (SPEC-3-018). Ponto de aprovação antes disso: nenhum.

## Checklist de execução

- [ ] Exportação de todas as coleções com resumo.
- [ ] Pacote sem segredo.
- [ ] Restauração em ambiente separado com contagens iguais.
- [ ] Recuperação das leituras provada.
- [ ] Evidências em `05_entregas/fase-3/spec-3-016/`.

## Critérios de aceite

- [ ] **CA-3-43:** quem tem `exportar_dados` baixa um pacote com todas as coleções complementares e um resumo de contagens que bate com o sistema; o pacote não tem segredo, senha nem chave; quem não tem a ação recebe 403.
- [ ] **CA-3-44:** a cópia de segurança é restaurada num ambiente separado com as mesmas contagens por coleção; falha simulada nas leituras do Omie e da Nuvemshop mantém o último lote válido e retoma sem duplicar.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | P3.16-01: exportar sem a ação | `node --test tests/pcp/spec-3-016.test.mjs` | 403 | `05_entregas/fase-3/spec-3-016/` |
| RED | P3.16-02: procurar segredo no pacote | Varredura do pacote | Nada encontrado | Idem |
| GREEN | P3.16-03: exportação e resumo | Skip | Contagens iguais às do sistema | Idem |
| GREEN | P3.16-04: restauração no ambiente separado | Skip | Contagens iguais por coleção | `recuperacao.md` |
| REFACTOR/REGRESSÃO | P3.16-05: falha simulada nas leituras; provas da fase 1 | Simulador e testes | Último lote mantido; retomada sem duplicar; verdes | Idem |

**Dados/fixtures:** coleções de demonstração; simulador de falha do Omie e da Nuvemshop.  
**Caminhos de erro obrigatórios:** sem ação, segredo no pacote, coleção faltando, falha de leitura.  
**Evidência exigida:** resumo de contagens, relatório de recuperação e saída dos testes.

## Teste humano do cliente

Esta SPEC não tem teste próprio. O cliente confere os pontos abaixo na sessão de validação final (SPEC-3-018); até lá, as tasks fecham pelas provas automáticas.

- **Origem:** CL-007 (sessão de validação final)
- **Quem confere:** gestão
- **O que confere:** baixa o pacote, confere o resumo de contagens e vê o relatório de recuperação.
- **Resultado esperado:** contagens batem; o pacote é dos dados da empresa e não tem segredo.
- **Evidência do aceite:** o aceite da validação final (SPEC-3-018).

## Handoff e operação

- **Como demonstrar:** `/exportacao` e o relatório de recuperação.
- **Como operar depois:** a gestão exporta quando quiser guardar os dados.
- **Como monitorar:** data da última exportação.
- **Pendência conhecida:** nenhuma.

## Tasks vinculadas

Os ids vêm do portal na primeira sincronização (`pendente` até lá). Status e prazo ficam só no `fase.md`.

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| pendente | Exportar os dados do sistema com as contagens conferidas | American Goodies | SPEC-3-016 | CA-3-43 | P3.16-01, P3.16-02, P3.16-03 | 05_entregas/fase-3/spec-3-016/ | — | ☐ |
| pendente | Provar a recuperação das integrações e da cópia de segurança | American Goodies | SPEC-3-016 | CA-3-44 | P3.16-04, P3.16-05 | 05_entregas/fase-3/spec-3-016/ | — | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
