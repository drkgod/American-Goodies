# SPEC-3-014 — Relatórios comparativos de produção, consumo, perdas, compras e pedidos

**Fase:** 3  
**Status:** planejada  
**Dono:** American Goodies (gestão) com o Maestro; conferência na validação final  
**Origem no escopo:** antiga fase 5 (relatórios comparativos de produção, consumo, perdas declaradas, compras e pedidos, com período, fonte, atualização e limites); antiga fase 4 ("taxa de perda usa apenas medida validada, unidade compatível e denominador explicitado"); fluxo-alvo 6 (categorias separadas de diferença); fluxo-alvo 13 (relatórios com período, origem e limites); RQ-009/013  
**Degrau da solução:** reuso — consulta os registros das fases 1 a 3; nenhuma integração nova.

## Contexto e decisões fechadas

- **Estado atual:** os dados de programação, apontamento, conferência, compras, recebimento e pedidos existem em telas separadas; não há relatório comparativo por período.
- **Estado desejado:** dois conjuntos de relatórios por período, com filtro por produto, área e unidade: (1) produção, consumo e perdas declaradas; (2) compras e pedidos. Cada relatório mostra período, fonte, hora da atualização e limites.
- **Decisões já fechadas:**
  - Consumo previsto pela ficha e consumo registrado ficam lado a lado; diferença sem causa, perda declarada, resíduo e revisão de receita são categorias separadas; nada é chamado de desperdício ou fraude.
  - Taxa de perda declarada = perda declarada ÷ produção realizada, na mesma unidade, com o denominador escrito no relatório; unidade incompatível não calcula.
  - Relatório não soma intenção da Nuvemshop ao confirmado.
  - Acesso por área: cada bloco exige a área correspondente.
- **Bloqueios:** nenhum para construir.

## Resultado observável

Em `/relatorios`, a gestão escolhe o período e vê: planejado × produzido × conferido; consumo pela ficha × registrado, com as quatro categorias; taxa de perda declarada com o denominador; comprado × recebido, entregas no prazo e preço médio por fornecedor; pedidos por origem e unidade, aptos e bloqueados e tempo até liberar. No rodapé de cada bloco: fonte, hora da atualização e lacunas.

## Limites e dependências

- **Inclui:** os relatórios acima; filtros; exportação do relatório em planilha; rodapé de fonte e limites.
- **Fora de escopo:** custo contábil; margem; previsão; relatório com dado pessoal.
- **Entradas e pré-condições:** registros das fases 1 a 3.
- **Saídas/artefatos:** rotas de relatório; tela `/relatorios`; evidências em `05_entregas/fase-3/spec-3-014/`.
- **Dependências e responsáveis:** Maestro constrói; gestão usa.
- **Atores e permissões mínimas:** cada bloco exige a área (producao, compras, faturamento); gestão vê o que a matriz der.
- **Superfícies/arquivos/configurações afetadas:** `/relatorios`.
- **Risco e plano B:** bloco sem dado no período mostra "sem dados no período", nunca zero.
- **Rollback ou reversão:** desligar a rota; nada é gravado.

## Dados e integrações

| Origem/destino | Fonte de verdade | Campos/contrato | Autenticação/permissão | Timeout/retry/idempotência | Tratamento de erro |
|---|---|---|---|---|---|
| Relatórios | Lotes ativos do Omie e registros do Skip Cloud | Por bloco: período, filtros, linhas, totais por unidade, fonte, hora, lacunas | Área de cada bloco | Só leitura | Fonte em falha: bloco com "lote antigo" e a hora |

| Regra de negócio | Condição | Ação/resultado | Exceção | Fonte |
|---|---|---|---|---|
| RN-01 | Unidades diferentes | Totais separados por unidade | — | Regras comuns, item 4 |
| RN-02 | Perda declarada sem produção realizada no período | Taxa "não calculável" | — | Escopo, antiga fase 4 |
| RN-03 | Consumo acima da ficha sem perda declarada | "Diferença sem causa", não perda | — | Fluxo-alvo 6 |
| RN-04 | Pedido da Nuvemshop não pago | Fora do total confirmado | — | Decisão 6 |
| RN-05 | Bloco sem área | Não aparece; sem pistas | — | Regras comuns, item 3 |

## Fluxo e regras

1. Montar os relatórios de produção, consumo e perdas.
2. Montar os relatórios de compras e pedidos.
3. Aplicar filtros, rodapé de fonte e acesso por bloco.

| Cenário | Dado/condição | Resultado esperado | Caminho de erro/recuperação |
|---|---|---|---|
| Principal | Produção de 100 UN com perda declarada de 4 UN | Taxa 4% com denominador "100 UN produzidas" | — |
| Limite | Consumo 5,4 KG para ficha de 5 KG, sem perda declarada | Diferença sem causa de 0,4 KG | — |
| Falha | Leitura do Omie em falha | Bloco mostra o último lote e a hora | — |

## Instruções de execução para o Maestro

1. **Ler antes de alterar:** esta SPEC; o índice da fase 3; `07-sistemas/pcp/painel.md`; as coleções das fases 2 e 3.
2. **Alterar somente:** rotas e tela de relatórios.
3. **Não alterar:** registros de origem.
4. **Executar nesta ordem:** produção, consumo e perdas; compras e pedidos.
5. **Parar e pedir validação quando:** nunca para construir.
6. **Estado válido ao parar:** painel e telas de origem iguais.
7. **Ritmo:** construir as tasks vinculadas em sequência, sem pedir autorização nem teste a cada task. Esta SPEC não tem teste próprio: o cliente confere o resultado na validação final (SPEC-3-018). Ponto de aprovação antes disso: nenhum.

## Checklist de execução

- [ ] Relatório de produção, consumo e perdas com categorias separadas.
- [ ] Relatório de compras e pedidos.
- [ ] Rodapé de fonte, hora e lacunas; acesso por bloco.
- [ ] Evidências em `05_entregas/fase-3/spec-3-014/`.

## Critérios de aceite

- [ ] **CA-3-39:** o relatório de produção mostra planejado, produzido e conferido; o de consumo mostra ficha e registrado com diferença sem causa, perda declarada, resíduo e revisão de receita separados; a taxa de perda declarada usa a mesma unidade e mostra o denominador, ou "não calculável".
- [ ] **CA-3-40:** o relatório de compras mostra comprado e recebido, entregas no prazo e preço médio por fornecedor; o de pedidos mostra pedidos por origem e unidade, aptos e bloqueados e tempo até liberar; todo bloco mostra período, fonte, hora e lacunas e exige a área correspondente.

## TDD da SPEC

| Etapa | Prova | Comando/ação | Resultado esperado | Evidência |
|---|---|---|---|---|
| RED | P3.14-01: perda sem produção no período | `node --test tests/pcp/spec-3-014.test.mjs` | "Não calculável" | `05_entregas/fase-3/spec-3-014/` |
| RED | P3.14-02: perfil sem a área de compras | Fixture | Bloco ausente, sem pistas | Idem |
| GREEN | P3.14-03: 100 UN produzidas e 4 de perda | Fixture | 4% com o denominador | Idem |
| GREEN | P3.14-04: compras e pedidos de demonstração | Fixture | Totais conferem com os registros | Idem |
| REFACTOR/REGRESSÃO | P3.14-05: painel da fase 1 | Testes | Verdes | Idem |

**Dados/fixtures:** ordens, apontamentos, compras, recebimentos e pedidos de demonstração.  
**Caminhos de erro obrigatórios:** sem dados, unidades diferentes, sem área, fonte em falha.  
**Evidência exigida:** saída dos testes e captura dos relatórios.

## Teste humano do cliente

Esta SPEC não tem teste próprio. O cliente confere os pontos abaixo na sessão de validação final (SPEC-3-018); até lá, as tasks fecham pelas provas automáticas.

- **Origem:** CL-007 (sessão de validação final)
- **Quem confere:** gestão e PCP
- **O que confere:** os relatórios de um período real batem com as telas de origem; a taxa de perda mostra o denominador.
- **Resultado esperado:** números conferidos; nada de perda inferida.
- **Evidência do aceite:** o aceite da validação final (SPEC-3-018).

## Handoff e operação

- **Como demonstrar:** `/relatorios` num período real.
- **Como operar depois:** gestão consulta e exporta.
- **Como monitorar:** lacunas por bloco.
- **Pendência conhecida:** nenhuma.

## Tasks vinculadas

Os ids vêm do portal na primeira sincronização (`pendente` até lá). Status e prazo ficam só no `fase.md`.

| ID | Task | Dono | SPEC | Critério | Recorte da prova | Evidência esperada | Pré-condições | Status |
|---|---|---|---|---|---|---|---|---|
| pendente | Montar os relatórios de produção, consumo e perdas declaradas | American Goodies | SPEC-3-014 | CA-3-39 | P3.14-01, P3.14-03 | 05_entregas/fase-3/spec-3-014/ | — | ☐ |
| pendente | Montar os relatórios de compras e de pedidos | American Goodies | SPEC-3-014 | CA-3-40 | P3.14-02, P3.14-04, P3.14-05 | 05_entregas/fase-3/spec-3-014/ | — | ☐ |

## Emendas

| Data | Origem do sinal | Micro-spec/task | Motivo |
|---|---|---|---|
| | | | |
