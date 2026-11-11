# Preparação da sessão de validação final (SPEC-4-007) — roteiro, condições e provas

Atualizada em 11/11/2026 pelo executor (Maestro). Não é o registro da sessão: o aceite e as pendências ficam em `05_entregas/fase-4/validacao-final.md`, depois da sessão, e só o dono aceita. A sessão não tem data: o dono marca ao fim da construção (CL-007).

Versão no ar: Skip v0.0.223 (ref 80a1bbb). Esta versão substitui a de 30/10 (`05_entregas/fase-3/spec-3-018/preparacao-validacao-final.md`), que fica como histórico.

## 1. O que mudou desde 30/10

- A produção (programação, apontamentos, conferências, aprovação de consolidação) grava no servidor (SPEC-4-001); o limite do apontamento citado em 30/10 deixou de existir.
- Teste e demonstração ficam marcados e separados do real; as contas de teste têm perfil marcado como teste (migration 0048). Registro marcado nunca é autorizado nem enviado ao Omie.
- Menu por área, tela inicial, textos da operação, componentes do kit, celular e tablet, e o visual da proposta A com o logo do Mr. Cheney (SPECs 4-002 a 4-006).

## 2. Provas na véspera (VF-01 e VF-04)

| Item | Situação em 11/11 | O que falta |
|---|---|---|
| VF-01, módulos | 289 de 289 testes automáticos passaram (Node v24.22.1), espelhados em `07-sistemas/pcp/codigo/`. | Repetir na véspera. |
| VF-01, rotas no servidor | Nenhuma rota foi chamada com sessão aberta. | Sessão de teste do dono (a senha da conta de teste está no cofre do Skip; o Maestro não entra com senha). CA-4-28. |
| VF-01, espelho | Telas, componentes, tema e migrations 0047 e 0048 espelhados. Hooks espelhados (11/11): programação publicada, estado da produção, apontamento, conferência, aprovação da consolidação, marca de demonstração, dados por área e porta de login. | Os outros cerca de 90 hooks (compras, faturamento, Omie, alertas, assistente) ainda não estão espelhados. |
| VF-04, simulador | Provas de clique duplo, trabalhador duplicado, chave desligada e resposta perdida existem para as três escritas (`spec-3-002*.test.mjs` e correlatos). | Repetir na véspera. |
| Telas no celular e tablet | Provas estáticas verdes (SPEC-4-006). | Medição em 360, 768 e 1280 px e capturas com sessão aberta. |

## 3. Condições das escritas e dos loops (cumpridas e pendentes)

| Ordem | Liga | Cumprido | Pendente |
|---|---|---|---|
| 1 | `omie_op_escrita` (SPEC-3-002) | Código, simulador, autorização do dono e conferência por consulta; chave desligada. | Leitura real do Omie liberada (CL-PEND-006); conferências reais; escolha da ordem pelo dono (CL-PEND-011). |
| 2 | `omie_pedido_compra_escrita` (SPEC-3-006) | Código, simulador, autorização do dono, contrato lido do WSDL; chave desligada. | Alçadas (CL-PEND-008) e tolerância (CL-PEND-001); fornecedor e itens cadastrados no Omie (CL-PEND-013); código do fornecedor no Omie; autorização do dono com ele presente. |
| 3 | `omie_pedido_venda_escrita` (SPEC-3-009) | Código, simulador, autorização do dono, contrato lido do WSDL; chave desligada. | Unidades, tabela e frete (CL-PEND-010); leitura de clientes; autorização do dono. Três pontos do contrato só se confirmam na primeira gravação: valores aceitos de `modalidade`, `etapa` inicial do pedido manual e se a alteração aceita só o bloco de frete (a inclusão pode ser recusada até lá). |
| 4 | `omie_recebimento_escrita` (SPEC-3-007) | Nada: não construído. | Origem das notas de entrada em revisão (CL-PEND-007); só entra se o consultor emendar a SPEC. |
| 5 | LOOP-01 e LOOP-02 | Medida, tela, veredito e recusa de ligar sem condições; fichas em `07-sistemas/pcp/loops.md`; ambos desligados. | Linha de base, alvo, janela e validador (CL-PEND-005); perguntas prioritárias (LOOP-02); cadastro no Maestro (feito pelo consultor, o executor não tem a ferramenta). |

Outras entradas que travam a conferência com dados reais: matriz de acesso aprovada (CL-003) e contas reais com as ações novas; parâmetros de alerta e regra de sazonalidade do PCP (CL-PEND-001); marcador do Lunet no Omie; limite de gasto da IA do assistente (CL-PEND-014); apontamentos e ordens de produção ainda não guardados no servidor (relatórios de produção e consumo ficam "sem dados no período"); descarte do projeto de teste nº 70908 pelo dono.

## 4. Roteiro por área (o que cada um confere)

| Área | Quem | O que confere |
|---|---|---|
| PCP | PCP e dono | Três produtos do catálogo e a lista do que falta cadastrar (3-001); números de três sugestões; programação de um produto real apontada e conferida; alertas de estoque, produção e divergência reais e itens sem parâmetro como lacuna (3-010, 3-011); comparação de dois produtos com anos anteriores e "histórico insuficiente" (3-012); relatórios de um período (3-014). |
| Dono | Dono | Escolhe uma ordem de produção conferida, confere o que vai ser gravado e autoriza (3-002); autoriza, uma por vez e na ordem acima, as escritas cuja condição estiver cumprida (3-006, 3-009); aceite global. |
| Compras | Comprador e aprovador | Permissões; fornecedor real com contatos e prazo; item sem cadastro barrado; conversão de insumo pelo fator (3-003); histórico de dois insumos e pedido com frete (3-004); sugestão que vira requisição com duas cotações e aprovação dentro da alçada, e alteração que pede nova aprovação (3-005); entregas em aberto de um fornecedor real e lançamento do pedido com a autorização do dono (3-006); alertas de compra e preço (3-010, 3-011). |
| Almoxarifado e financeiro | Almoxarifado e financeiro | Recebimento real ligado a dois pedidos; compra paga antes com o aviso; pré-conferência com nota de demonstração (3-007). |
| Faturamento e expedição | Faturamento, expedição e dono | Três unidades reais e nome fantasia certo; nome de canal em revisão; subtotal recalculado e origem de um pedido real (3-008); expedição conta volumes, pedido fica apto e é liberado, pedido manual repetido é barrado, gravação de volumes e frete com o dono (3-009); alertas de pedido (3-010, 3-011). |
| Gestão e validador | Gestão e validador | Medida do LOOP-01 de um ciclo e, com condições, ligar e registrar o primeiro veredito (3-013); três perguntas reais ao assistente, uma fora da área de outra pessoa e um pedido de ação recusado (3-015); baixar o pacote e conferir o resumo de contagens (3-016); perguntas prioritárias, revisão das respostas da sessão e medida do LOOP-02 (3-017). |

Cada área também tenta abrir uma tela e fazer uma pergunta ao assistente de outra área (VF-03): o esperado é "negado" sem pistas.

## 5. Fluxo integrado real (VF-02), com um produto
Pedido → sugestão → programação → apontamento → conferência → aprovação do PCP; necessidade de insumo → requisição → cotação → aprovação → entrega → recebimento; pedido de venda → unidade, tabela, frete e volumes → apto → liberado. Tudo no servidor, com dado real do dia; nada marcado como teste.

## 6. Regras da sessão
- Uma ativação por vez, na ordem da seção 3; escrita sem condição cumprida fica desligada e vira pendência.
- "Pode continuar", "passou" ou "testei" fora da sessão não valem como aceite, e ausência de relato não aprova.
- Falha sem aceite explícito de risco fica pendente; correção volta para a SPEC de origem, não é feita durante a sessão.
- Depois da sessão, o executor registra o aceite e as pendências em `validacao-final.md`, grava `etapa: projeto_aguardando_encerramento` e para. O encerramento é do consultor.
