# Fase 3 — o que a American Goodies precisa enviar ou decidir (26/10/2026)

A fase 3 é a última e reúne tudo o que falta do projeto (AC-26-01). Nenhum item desta lista trava a construção: o Maestro constrói tudo com as gravações no Omie desligadas e usa cada dado quando ele chegar. Enquanto um dado não chega, só a parte que depende dele fica pendente.

O único teste é a sessão de validação final com a equipe, prevista no portal para 03/12/2026. Nela, cada gravação no Omie só é ligada pelo dono, uma por vez, se a condição abaixo estiver cumprida. O dono também pode autorizar antes, quando a condição estiver cumprida. Gravação sem condição fica desligada e vira pendência, sem travar o resto.

## Para a sessão de validação final

| ID | Item | Para que serve |
|---|---|---|
| CL-007 | Marcar a sessão de validação final com o dono, o PCP, a cozinha e o encaixotamento, a expedição e a câmara fria, Compras, o almoxarifado, o financeiro e o faturamento | Único teste do projeto (SPEC-3-018) |
| CL-003 | Aprovar a matriz de acesso com as ações novas: compras (comprador, aprovador, exceção), recebimento (almoxarifado, financeiro), faturamento (preparar, conferir volumes, liberar), alertas (quem trata cada área), assistente, exportação e validação dos loops. Só o dono autoriza gravação no Omie | Contas reais nas telas novas (SPECs 3-003, 3-008, 3-011, 3-015 e 3-016) |
| CL-PEND-005 | Definir, para cada loop, a linha de base, o alvo, a janela de medição e quem valida; listar as perguntas prioritárias que a gestão quer ver respondidas | Ligar LOOP-01 e LOOP-02 (SPECs 3-013 e 3-017) |

## Condições para ligar cada gravação no Omie

| Gravação | Condição | IDs | SPEC |
|---|---|---|---|
| Conclusão da ordem de produção | O dono escolhe uma ordem de produção conferida e aprovada pelo PCP, confere na tela o que vai ser gravado e autoriza | CL-PEND-011 | 3-002 |
| Pedido de compra | O dono autoriza; alçadas cadastradas; fornecedor e itens cadastrados no Omie | CL-PEND-011, CL-PEND-008, CL-PEND-013 | 3-006 |
| Pedido de venda (pedido manual, volumes e frete do pedido liberado) | O dono autoriza; unidades, tabela de preço e regra de frete confirmadas. A nota fiscal continua sendo emitida por uma pessoa no Omie | CL-PEND-011, CL-PEND-010 | 3-009 |
| Recebimento da compra | Em revisão: só depois de responder onde estão as notas de entrada e de o consultor ajustar a SPEC; depois, autorização do dono | CL-PEND-007, CL-PEND-011 | 3-007 |

| ID | Item | Para que serve |
|---|---|---|
| CL-PEND-011 | Autorizar, na sessão final ou antes, cada tipo de gravação no Omie. A primeira de cada tipo é feita com o dono presente e conferida no Omie logo depois; depois dela, o dono decide se a gravação fica ligada | Todas as gravações acima |

## Entradas que completam o resultado

| ID | Item | Para que serve |
|---|---|---|
| CL-PEND-006 | Resolver o bloqueio da chave do Omie por excesso de consultas: acionar o suporte do Omie ou revisar a chave e dizer se outro sistema usa a mesma chave | Catálogo real e todas as leituras reais (SPECs 3-001, 3-003, 3-004, 3-006, 3-008, 3-010 e 3-012) |
| CL-PEND-013 | Cadastrar no Omie os produtos da lista "falta cadastrar" que o sistema vai mostrar, e cadastrar todo item antes da primeira compra | Catálogo completo e compra sem exceção (SPECs 3-001 e 3-003) |
| CL-PEND-007 | Dizer onde ficam as notas fiscais de entrada (outro módulo ou tela do Omie, como o recebimento de NF-e, ou outro sistema), quem lança hoje e, se possível, mostrar uma nota recebida | Tirar da revisão a pré-conferência real e a gravação do recebimento (SPEC-3-007) |
| CL-PEND-008 | Informar as alçadas de aprovação de compra: quem aprova, até que valor e quem aprova compra emergencial | Aprovação real das compras (SPEC-3-005) |
| CL-PEND-009 | Confirmar os fatores de conversão dos insumos comprados (ex.: saco de 25 kg = 25 KG), por fornecedor quando a embalagem mudar | Conversão e comparação de preço (SPECs 3-003 a 3-005) |
| CL-PEND-012 | Conferir se o cadastro de fornecedores do Omie está completo para os insumos comprados e preencher na tela os contatos e o prazo de entrega de cada um | Fornecedores, entregas e alertas de compra (SPECs 3-003, 3-006 e 3-010) |
| CL-PEND-010 | Para cada unidade que recebe pedido: nome fantasia usado na operação, tabela de preço, modalidade de frete e quem conta os volumes | Preparação de pedidos para faturar (SPECs 3-008 e 3-009) |
| CL-PEND-001 | Parâmetros: estoque mínimo, lote, prazo de fornecedor, margem e tolerância de preço; parâmetros de alerta por produto ou família (atraso aceito, tempo máximo parado, gravidade de cada regra); e quantos anos de histórico o PCP exige para falar em sazonalidade | Sugestões, cotações, alertas e sazonalidade (SPECs 3-001, 3-005, 3-010 e 3-012) |
| CL-PEND-014 | Se o plano do Skip cobrar à parte pelo uso de IA, informar o limite de gasto mensal do assistente | Assistente de consulta (SPEC-3-015) |
| CL-PEND-003 | Já existente: só pedir acesso direto à Lunet se faltar alguma informação que o Omie não traz | Origem dos pedidos e duplicatas (SPECs 3-008 e 3-009) |

## Mensagem pronta para o WhatsApp

```text
*American Goodies — fase 3 liberada*

A fase 3 é a última e já tem tudo o que falta do sistema: compras, recebimento, preparação de pedidos, alertas, relatórios e o assistente de consulta. O Maestro constrói em sequência, sem parar para teste. O único teste é a sessão final com a equipe, prevista para 03/12.

O que precisamos de vocês:

☐ *Omie bloqueado:* decidir entre acionar o suporte do Omie ou revisar a chave
☐ *Notas de entrada:* onde ficam hoje e quem lança
☐ *Alçadas de compra:* quem aprova e até que valor
☐ *Fatores de conversão:* ex.: saco de 25 kg = 25 KG, para os insumos comprados
☐ *Unidades:* nome fantasia, tabela de preço, frete e quem conta os volumes
☐ *Parâmetros:* estoque mínimo, prazo dos fornecedores, tolerância de preço e alertas
☐ *Acessos:* aprovar quem faz o quê nas telas novas
☐ *Loops e perguntas:* metas dos loops e as perguntas que a gestão quer ver respondidas
☐ *Cadastro no Omie:* cadastrar os produtos que o sistema mostrar como faltando
☐ *Sessão final:* marcar o dia com o dono e as áreas

Nada disso trava a construção. As gravações no Omie só são ligadas com a autorização do dono.
```

Antes de pedir qualquer entrada, o Maestro confere o que já foi recebido. Arquivos com dados financeiros, de clientes ou de contatos ficam no Skip Cloud ou na pasta da empresa; no Git só referência e estado. Esta publicação não confirma recebimento de nenhum item nem altera o portal.
