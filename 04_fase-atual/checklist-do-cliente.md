# Fase 4 — o que a American Goodies precisa enviar ou decidir (03/11/2026)

A fase 4 liga as telas de produção ao servidor, dá ao sistema a cara e a linguagem da American Goodies (no computador, no tablet e no celular) e termina na sessão de validação final com a equipe. Nenhum item desta lista trava a construção. Enquanto um dado não chega, só a parte que depende dele fica pendente.

## Novos na fase 4

| ID | Item | Para que serve |
|---|---|---|
| CL-PEND-015 | Mandar o logo da American Goodies e as cores da marca. Logo em SVG, ou PNG com fundo transparente de pelo menos 512 px; se houver, também a versão só com o símbolo. Cores em código (por exemplo, #1A2B3C) ou o manual da marca. Se a marca usa uma fonte própria, o nome dela | Propostas de visual (SPEC-4-002) |
| CL-008 | O dono escolhe uma das 3 propostas de visual que o Maestro mostrar | Visual aplicado no sistema (SPEC-4-002) |
| CL-PEND-016 | Criar no sistema dois usuários de teste e entregar o acesso direto ao Maestro (nunca em grupo de WhatsApp): um com todas as áreas, ações e pontos, menos a de autorizar gravação no Omie, e outro com uma área só. O Maestro marca os dois como de teste no perfil (SPEC-4-001), e tudo o que eles gravarem fica marcado como demonstração | Testar as telas e as rotas no servidor e fazer as capturas com sessão aberta (SPECs 4-001 a 4-007) |

## Para a sessão de validação final

| ID | Item | Para que serve |
|---|---|---|
| CL-007 | Marcar a sessão de validação final com o dono, o PCP, a cozinha e o encaixotamento, a expedição e a câmara fria, Compras, o almoxarifado, o financeiro e o faturamento. Cada pessoa leva o aparelho que usa no trabalho | Único teste com a equipe (SPEC-4-007) |
| CL-003 | Aprovar a matriz de acesso com as ações novas: compras (comprador, aprovador, exceção), recebimento (almoxarifado, financeiro), faturamento (preparar, conferir volumes, liberar), alertas (quem trata cada área), assistente, exportação e validação dos loops. Só o dono autoriza gravação no Omie | Contas reais nas telas (SPECs 3-003, 3-008, 3-011, 3-015, 3-016 e 4-007) |
| CL-PEND-005 | Definir, para cada loop, a linha de base, o alvo, a janela de medição e quem valida; listar as perguntas prioritárias que a gestão quer ver respondidas | Ligar LOOP-01 e LOOP-02 (SPECs 3-013 e 3-017) |

## Condições para ligar cada gravação no Omie

| Gravação | Condição | IDs | SPEC |
|---|---|---|---|
| Conclusão da ordem de produção | O dono escolhe uma ordem conferida e aprovada pelo PCP, confere na tela o que vai ser gravado e autoriza | CL-PEND-011 | 3-002 |
| Pedido de compra | O dono autoriza; alçadas cadastradas; fornecedor e itens cadastrados no Omie | CL-PEND-011, CL-PEND-008, CL-PEND-013 | 3-006 |
| Pedido de venda (pedido manual, volumes e frete do pedido liberado) | O dono autoriza; unidades, tabela de preço e regra de frete confirmadas. A nota fiscal continua sendo emitida por uma pessoa no Omie | CL-PEND-011, CL-PEND-010 | 3-009 |
| Recebimento da compra | Em revisão: só depois de responder onde estão as notas de entrada e de o consultor ajustar a SPEC; depois, autorização do dono | CL-PEND-007, CL-PEND-011 | 3-007 |

| ID | Item | Para que serve |
|---|---|---|
| CL-PEND-011 | Autorizar, na sessão final ou antes, cada tipo de gravação no Omie. A primeira de cada tipo é feita com o dono presente e conferida no Omie logo depois | Todas as gravações acima |

## Entradas que continuam da fase 3

| ID | Item | Para que serve |
|---|---|---|
| CL-PEND-006 | Resolver o bloqueio da chave do Omie: abrir o chamado no suporte do Omie pedindo o desbloqueio da chave de integração (código MISUSE_API_PROCESS) e dizer se outro sistema usa a mesma chave. Depois do desbloqueio, gerar nova chave e novo segredo de integração no Omie e trocar no segredo do Skip, porque a chave antiga ficou em arquivos de diagnóstico. Avisar o Maestro quando o Omie liberar | Todas as leituras reais (SPEC-4-007) |
| CL-PEND-013 | Cadastrar no Omie os produtos da lista "falta cadastrar" que o sistema vai mostrar, e cadastrar todo item antes da primeira compra | Catálogo completo e compra sem exceção (SPECs 3-001 e 3-003) |
| CL-PEND-007 | Dizer onde ficam as notas fiscais de entrada (outro módulo ou tela do Omie, como o recebimento de NF-e, ou outro sistema), quem lança hoje e, se possível, mostrar uma nota recebida | Tirar da revisão a pré-conferência real e a gravação do recebimento (SPEC-3-007) |
| CL-PEND-008 | Informar as alçadas de aprovação de compra: quem aprova, até que valor e quem aprova compra emergencial | Aprovação real das compras (SPEC-3-005) |
| CL-PEND-009 | Confirmar os fatores de conversão dos insumos comprados (por exemplo, saco de 25 kg = 25 KG), por fornecedor quando a embalagem mudar | Conversão e comparação de preço (SPECs 3-003 a 3-005) |
| CL-PEND-012 | Conferir se o cadastro de fornecedores do Omie está completo para os insumos comprados e preencher na tela os contatos e o prazo de entrega de cada um | Fornecedores, entregas e alertas de compra (SPECs 3-003, 3-006 e 3-010) |
| CL-PEND-010 | Para cada unidade que recebe pedido: nome fantasia usado na operação, tabela de preço, modalidade de frete e quem conta os volumes | Preparação de pedidos para faturar (SPECs 3-008 e 3-009) |
| CL-PEND-001 | Parâmetros: capacidade e dias de produção de cada recurso (por exemplo, quantos dias da semana são de cookies e quantos de exclusivos), estoque mínimo, lote, prazo de fornecedor, margem e tolerância de preço; parâmetros de alerta por produto ou família (atraso aceito, tempo máximo parado, gravidade de cada regra); e quantos anos de histórico o PCP exige para falar em sazonalidade | Programação, sugestões, cotações, alertas e sazonalidade (SPECs 4-001, 3-001, 3-005, 3-010 e 3-012) |
| CL-PEND-014 | Se o plano do Skip cobrar à parte pelo uso de IA, informar o limite de gasto mensal do assistente | Assistente de consulta (SPEC-3-015) |
| CL-PEND-003 | Já existente: só pedir acesso direto à Lunet se faltar alguma informação que o Omie não traz | Origem dos pedidos e duplicatas (SPECs 3-008 e 3-009) |

Antes de pedir qualquer entrada, o Maestro confere o que já foi recebido. Arquivos com dados financeiros, de clientes ou de contatos ficam no Skip Cloud ou na pasta da empresa; no Git só referência e estado. Esta publicação não confirma recebimento de nenhum item nem altera o portal.
