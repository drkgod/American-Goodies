# SPEC-1-003 — Pedidos complementares e vínculo entre canais

**Fase:** 1  
**Status:** planejada; implementação e testes ainda não executados.  
**Dono do aceite:** responsável designado pelo cliente, a confirmar.  
**Origem:** RQ-005 / RQ-012 / P1 / P2  
**Degrau da solução:** recurso nativo da plataforma e construção mínima — reutilizar Skip, MCP do Skip e Skip Cloud aprovados; adaptar somente o necessário ao fluxo.

## Contexto e decisões fechadas

Pedidos Nuvemshop chegam ao Omie depois do pagamento; a operação quer enxergar também os anteriores. Lunet atende lojas próprias e já integra ao Omie sem trava de pagamento. Não recriar essas integrações nem pedir uma API Lunet sem informação faltante comprovada.

Ambiente: Skip/MCP do Skip/Skip Cloud. **Pré-condições:** SPEC-1-001 e leitura de pedidos da SPEC-1-002; CL-002 para conexão de leitura Nuvemshop. Chave de referência do pedido entre sistemas deve ser comprovada em amostra; sem referência, bloquear só vínculo/contagem consolidada afetada.

## Resultado observável

Lista de pedidos mostra intenção pendente, pago aguardando Omie, vínculo confirmado e conflitos. Um pedido já integrado contribui uma vez para o total oficial; pedido de loja própria não é rejeitado por ausência de pagamento prévio.

## Limites e dependências

- Inclui leitura de pedidos/status, itens e referência; normalização, vínculo comprovado e lista de exceções.
- Exclui baixar estoque, criar pedido, marcar pagamento, faturar, portal comercial ou ler dados de cartão.
- Dados de cliente limitados à identificação operacional necessária; não importar contatos/endereço financeiro inteiro só porque a API devolve.
- Saídas: dados no mesmo mecanismo de lotes da SPEC-1-002; contratos/crosswalk em 07-sistemas/pcp/contratos-canais.md; evidências em 05_entregas/fase-1/spec-1-003/.
- Atores: leitura de pedidos somente área autorizada; atualização somente executor com permissão técnica.
- Rollback: desativar complemento e preservar lista oficial Omie; desfazer vínculo derivado sem excluir original.
- Plano B: canal indisponível visível, com último lote antigo; não substituir por pedido presumido.

## Dados e integrações

Campos de origem selecionados: store_id, id, number, status, payment_status, created_at, updated_at e itens com id, product_id/variant_id, quantity e subtotal quando necessário. IDs como texto. Estes campos e o recurso GET /orders constam da [documentação oficial Nuvemshop](https://tiendanube.github.io/api-documentation/resources/order); confirmar versão, autenticação, paginação e escopos no acesso autorizado.

Contrato normalizado: loja_id, pedido_origem_id, numero_origem, estado_origem, pagamento_origem, itens, criado_em, atualizado_em, pedido_omie_id (nullable), vinculo_estado e estado_operacional. Idempotência fonte+loja+pedido_origem_id; cada linha do pedido mantém ID próprio, sem colapsar variantes repetidas.

Estados operacionais:
- vinculado_omie: referência comprovada aponta para um pedido oficial, independentemente do requisito de pagamento aplicável ao canal.
- pendente_pagamento: somente pending/authorized sem cancelamento ou vínculo, respeitando a precedência abaixo.
- pago_sem_vinculo: paid, não cancelado, ainda sem referência oficial comprovada.
- cancelado: cancelamento confirmado; não aumenta demanda.
- conflito: referência múltipla/incompatível ou associação divergente.
- status_nao_mapeado: estado novo/ambíguo; sem confirmação por suposição.

Somente status comercial Omie comprovadamente elegível compõe pedidos oficiais ativos; orçamento/cancelado não entra por existir no ERP. Mapeamento de etapas é registrado em contratos-omie.md. Os totais de Nuvemshop são separados e não somados aos oficiais quando o vínculo ainda é desconhecido.

## Fluxo e regras

1. Ler todas as páginas da janela registrada, incluindo status de pagamento distintos. Paginação incompleta não ativa lote.
2. Normalizar sem perder status bruto ou linha de produto.
3. Priorizar cancelado; procurar referência de origem comprovada; depois classificar pagamento.
4. Vínculo exige loja+ID/referência correspondente no Omie. Não igualar id a number; não deduplicar apenas por CNPJ+valor+data.
5. Dois candidatos ou pedido manual sem referência entram na fila de conflito, sem apagar nem juntar original.
6. Na visão consolidada, um vínculo confirmado é uma linha oficial com contexto do canal. Sem vínculo, mostrar complemento separado e aviso de total não consolidável, sem inventar ID.
7. Falha Nuvemshop não apaga pedidos Omie. Cancelamento externo em conflito com Omie sinaliza divergência; não cancela ERP.
8. Usar timeout/retry/lotes da SPEC-1-002 e secrets no servidor. Não chamar operações mutantes.

## Instruções de execução para o Ethos

1. Ler esta SPEC, spec-1-002-leitura-omie.md e contratos-canais.md se existente; verificar projeto/conexão pelo MCP do Skip.
2. Confirmar leitura Nuvemshop, docs/versionamento/escopos e duas amostras com referência existente. Não criar conexão Lunet por inferência.
3. Acrescentar normalizador de canal ao backend Skip Cloud, com rotas/serviços no namespace PCP; aplicar autorização de pedidos no servidor.
4. Implementar classificação e crosswalk determinístico; modificar só a camada complementar, sem escrever no Omie/Nuvemshop.
5. Rodar fixtures e QA nativo. Parar diante de referência não comprovada, escopo ausente ou dado inesperado; deixar fluxo oficial funcionando e conflito visível.
6. Demonstrar status/vínculo a responsável e aguardar teste humano antes da próxima task.

## Checklist de execução

- [ ] Loja/acesso/versionamento e janela registrados.
- [ ] Estados brutos preservados, origem e horário visíveis.
- [ ] Referência cruzada comprovada em amostra.
- [ ] Pendência/cancelamento/conflito não inflaciona confirmado.
- [ ] Falha do canal preserva Omie; sem dados pessoais excessivos.

## Critérios de aceite

- [ ] **CA-N1:** pedido Nuvemshop não pago aparece como intenção separada; cancelado não aumenta demanda.
- [ ] **CA-N2:** paid sem referência fica aguardando vínculo; loja própria válida no Omie não é bloqueada por ausência de pagamento prévio.
- [ ] **CA-N3:** vínculo comprovado conta uma vez; mesma pessoa/valor sem referência não é mesclado; conflito preserva originais e sinaliza total não consolidável.
- [ ] **CA-N4:** mudança de status atualiza o registro uma vez; paginação/falha não apaga lista Omie nem divulga segredo.

## TDD da SPEC

| Etapa | Prova / ação | Resultado esperado | Evidência |
|---|---|---|---|
| RED | Teste da massa N1–N4 antes do normalizador | Reprova classificação/contagem | Relatório RED |
| GREEN | Consultar massa com pendente, pago vinculado, pago sem vínculo e loja própria Omie | Intenção separada; vinculado contado uma vez; loja própria preservada | Lista + total esperado |
| REFACTOR/REGRESSÃO | pending→paid, cancelar, repetir sincronização, falhar página 2 e fornecer referência ambígua | Atualiza uma vez; conflito sem merge; Omie continua visível | QA + estados antes/depois |

**Fixtures:** NS-10 pending sem Omie; NS-11 paid ligado à OM-11 com referência comprovada; NS-12 paid sem vínculo; OM-L1 de loja própria; NS-13 cancelado; NS-14 e pedido manual com mesmo cliente/valor mas sem referência. Confirmados oficiais = OM-11 e OM-L1, duas linhas; NS-12 é complemento pendente.
**Erros obrigatórios:** status desconhecido, refund/partially_paid sem confirmação automática, token inválido, página truncada, referência múltipla e ID diferente de number.
**Comandos/evidência:** runner do projeto + QA Skip; salvar cenários e resposta sanitizada em 05_entregas/fase-1/spec-1-003/. Integração real depende de amostra da conta, além das fixtures.

### Preflight e execução reproduzível dos testes

Antes do RED, inspecionar package.json, scripts e diretório de testes do projeto Skip pelo MCP, identificar o runner e registrar seu comando exato e versão na evidência. Criar os testes desta SPEC em tests/pcp/spec-1-003.test.mjs (ou arquivo equivalente do runner já instalado) e a massa sintética em tests/pcp/fixtures/. Não modificar o cliente PocketBase gerado para facilitar teste.

Se não houver runner, o harness mínimo autorizado é node:test, sem nova dependência. Verificar node --version no ambiente de build/QA; executar node --test tests/pcp/spec-1-003.test.mjs. Normalização/cálculo usa fixtures; autorização e rotas exigem teste de integração contra backend de homologação, com URL e tokens de teste em variáveis do ambiente, nunca em código/relatório. Se Node ou backend/contas autorizadas não estiverem disponíveis, parar o recorte e registrar a dependência técnica, sem declarar prova concluída.

RED só é válido quando o teste executa e falha pela ausência do comportamento esperado (assertion/resultado incorreto); erro de ambiente, login inválido não planejado ou comando inexistente não comprova RED. GREEN requer os cenários obrigatórios, incluindo chamadas API diretas e falhas. QA nativo do Skip é adicional, não substituto desses testes.

### Precedência da classificação e prova dos estados

Aplicar nesta ordem: (1) cancelado confirmado; (2) referência múltipla/incompatível ou divergência que inviabilize vínculo = conflito; (3) vínculo único comprovado = vinculado_omie, preservando o status externo e sinalizando reembolso/estado inesperado como divergência; (4) sem vínculo, paid = pago_sem_vinculo; (5) sem vínculo, pending ou authorized = pendente_pagamento; (6) qualquer outro estado, incluindo partially_paid, refunded, partially_refunded, voided, abandoned e valor desconhecido = status_nao_mapeado. Não confirmar ou descartar demanda por esses estados externos. A lista oficial segue a elegibilidade Omie comprovada; divergência do canal não cancela ERP.

**Prova adicional de CA-N1/N2/N3:** sem vínculo, fornecer pending, authorized, paid, partially_paid, refunded e estado novo; só pending/authorized ficam pendentes e só paid fica pago sem vínculo; os demais preservam o estado bruto e viram não mapeados. Com vínculo único e reembolso, preservar o pedido oficial e apresentar a divergência. Nenhum desses casos escreve nos canais.

## Teste humano do cliente

**Origem:** gate de execução; CL-002 é acesso.
Faturamento/PCP designado compara um pedido ainda não pago e um já integrado, confirma a distinção e a contagem única; observa loja própria e conflito de pedido manual. Registrar aceite explícito.

## Handoff e operação

Fila de vínculo é diagnóstico; responsável resolve associação/cadastro no fluxo autorizado, sem comando fiscal nesta fase. Não apresentar pedidos pagos sem vínculo como pedido Omie já existente. Se faltar origem Lunet no ERP, registrar lacuna ao consultor antes de adicionar conector.

## Tasks vinculadas

| ID | Task | Critério | Prova / recorte | Pré-condição | Evidência esperada |
|---|---|---|---|---|---|
| 0641975b-95f9-4c91-8a2d-c607f1a25c31 | Exibir pedidos pendentes da Nuvemshop | CA-N1, CA-N2 | Ler pedidos/status no servidor Skip Cloud e separar intenção de compra de registros oficiais do Omie; não alterar pedidos nos canais. | Pré-condições desta SPEC | 05_entregas/fase-1/spec-1-003/; fase 1 + título exato |
| b0502049-e8d5-480b-b3c0-01b69a05c7a4 | Relacionar pedidos de canais sem duplicação | CA-N3 | Vincular somente por referência de integração comprovada; preservar conflito e pedidos manuais sem tentar combinar apenas por cliente/valor. | Task anterior e teste humano confirmados | 05_entregas/fase-1/spec-1-003/; fase 1 + título exato |
| f2bda37f-9ce6-4014-a8d7-152e7e313fba | Testar pagamento pendente e falha do canal | CA-N1–N4 | Provar transições pago/não pago/cancelado, loja própria via Omie, referência ausente e indisponibilidade sem ocultar pedidos oficiais. | Task anterior e teste humano confirmados | 05_entregas/fase-1/spec-1-003/; fase 1 + título exato |

## Emendas

Nenhuma emenda aprovada até esta revisão.

## Adendo (15/10/2026) — reconciliação D5 (task a6bf06fb)

**Natureza:** adendo datado à SPEC-1-003 homologada, exigido pela regra D5 da SPEC-2-001 (documento
intermediário contraditório → adendo cita a prova final; contagem histórica não é valor eterno).
O texto original acima é preservado byte a byte — nada foi editado ou removido.

**O que o documento intermediário registrou:** no momento da homologação desta SPEC, a análise do
canal Nuvemshop ainda trabalhava com janela parcial e registrou a tese provisória de "referência
ausente" (2.589 referências no lote incompleto), além de contagens de canal anteriores à prova
final. Esses valores eram corretos **para o momento em que foram escritos** — são contagens
históricas de uma etapa intermediária, não valores eternos.

**O que a prova final de 08/10/2026 estabeleceu** (publicação em produção da Fase 1, versões
0.0.59→0.0.61, ref 4306849):

- Lote oficial Omie: **5393/5393** registros (ativação atômica após falhas parciais gen5–8);
- Canal Nuvemshop: **3344** pedidos na janela (total confirmado pela soma exata das classes);
- Vínculos comprovados: **44** (codigo_pedido_integracao = numero_origem), provados em
  05_entregas/fase-1/spec-1-003/evidencia-ca-n3-vinculo.md;
- duplicados_oficiais: **0/5393**;
- Correção da tese "referência ausente": com o lote completo, as 2.589 referências da janela
  parcial se reconciliam; **OH… = loja própria via Lunet** (não é referência ausente — é canal de
  loja própria, válido no Omie sem pagamento prévio, conforme CA-N2 desta SPEC);
- Regressão integrada R1–R8 8/8 com canal idêntico à visão (270 pendentes · 2647 pagos sem vínculo ·
  44 vinculados · 373 cancelados · 10 não mapeados; soma exata 3344) — ver
  05_entregas/fase-1/spec-1-005/relatorio-validacao-integrada.md.

**Efeito deste adendo:** os números intermediários desta SPEC (incluindo a tese de "referência
ausente") ficam declarados como histórico da análise, lidos sempre junto com a prova final de
08/10/2026 acima. Nenhum critério de aceite (CA-N1–N4) foi alterado; a implementação homologada
cumpre esta SPEC conforme os critérios originais.

**Fonte:** changelog operacional de 08/10/2026; evidência de vínculo em
05_entregas/fase-1/spec-1-003/; aceite final do owner ("validado", 18:23 de 08/10).