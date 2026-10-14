# Matriz nominal de acesso — v1 APROVADA (CL-003)

- **Versão**: v1 · 2026-10-14
- **Aprovador**: Mr Cheney (owner do projeto, via ETHOS)
- **Aprovação da diretriz**: 14/10/2026 11:34 BRT — "Aprovar matriz nominal CL-003"
- **Confirmação do conteúdo**: 14/10/2026 11:54 BRT — formulário de confirmação (contas padrão nome.sobrenome; suplente espelhado dos gerentes; rascunho confirmado como está; exclusão: Limpeza sem acesso)
- **Fonte do mapeamento**: 06_notas/organograma-2026-10.md (22 pessoas + 1 consultoria externa)
- **SPEC**: 04_fase-atual/specs/spec-2-000-acessos-e-pendencias.md · CA-A1
- **Regra de concessão**: área ou cargo NUNCA concede ação por implicação — somente o que está registrado abaixo
- **Ações F2 da SPEC**: consultar_planejamento, editar_programacao, editar_parametros, publicar_programacao, apontar_producao, conferir_expedicao, conferir_camara, aprovar_consolidacao, executar_sync_omie

## Decisões da v1 (confirmadas pelo aprovador)

1. **Contas Skip**: padrão automático `nome.sobrenome` (ex.: `adelma.cezar`), a serem criadas na task de ativação (49327a88) — nenhuma conta criada nesta task.
2. **Exclusões da v1 (sem acesso)**: Limpeza (Hellene Francisca Silva Sousa). Motorista (Renato Rodrigues de Carvalho) NÃO foi marcado como exclusão — mantido com conta criada e escopo zero pendente de definição pelo aprovador (nenhuma área/ação/ponto concedido por suposição).
3. **Suplente (Ronaldo Silva Reis)**: escopo espelhado dos gerentes (Arivaldo + Keoma), sem edição de parâmetros.
4. **Escopo por pessoa**: rascunho da análise confirmado como está.

## Matriz

| # | Pessoa | Função/setor | Conta (padrão) | Áreas | Ações | Pontos | Ativo |
|---|---|---|---|---|---|---|---|
| 1 | Arivaldo Missias Caboronga | Gerente — cozinhas, triagem, encaixotamento, limpeza | arivaldo.missias | producao, painel | consultar_planejamento, apontar_producao | cozinha, encaixotamento | sim |
| 2 | Adelma Cezar Alves | Cozinha Sobremesas | adelma.cezar | producao | apontar_producao | cozinha | sim |
| 3 | Antonio Carlos de Souza Junior | Cozinha Sobremesas | antonio.carlos | producao | apontar_producao | cozinha | sim |
| 4 | Caua Silva Reis | Cozinha Sobremesas | cauau.silva | producao | apontar_producao | cozinha | sim |
| 5 | Daniel Venancio Pires | Cozinha Sobremesas | daniel.venancio | producao | apontar_producao | cozinha | sim |
| 6 | Margarida da Silva Mattos | Cozinha Sobremesas | margarida.silva | producao | apontar_producao | cozinha | sim |
| 7 | Maria Marleide Pereira da Silva | Cozinha Sobremesas | maria.marleide | producao | apontar_producao | cozinha | sim |
| 8 | Paulo Shiroma | Cozinha Sobremesas | paulo.shiroma | producao | apontar_producao | cozinha | sim |
| 9 | Regivaldo Silva Reis | Cozinha Sobremesas | regivaldo.silva | producao | apontar_producao | cozinha | sim |
| 10 | Roberto Lopes dos Santos | Cozinha Sobremesas | roberto.lopes | producao | apontar_producao | cozinha | sim |
| 11 | Josiane Salvadora de Santana | Cozinha Salgados e Gelato | josiane.santana | producao | apontar_producao | cozinha | sim |
| 12 | Jhonas Weverton da Silva | Triagem | jhonas.silva | producao | apontar_producao | triagem | sim |
| 13 | Uillson Cafe dos Santos | Encaixotamento | uillson.santos | producao | apontar_producao | encaixotamento | sim |
| 14 | Hellene Francisca Silva Sousa | Limpeza | — (sem conta na v1) | — | — | — | não |
| 15 | Ronaldo Silva Reis | Gerente suplente — espelho dos gerentes | ronaldo.silva | producao, compras, painel | consultar_planejamento, apontar_producao, editar_programacao, publicar_programacao, aprovar_consolidacao, executar_sync_omie | cozinha, encaixotamento, expedicao | sim |
| 16 | Keoma Targino | Gerente — compras, PCP, expedição, faturamento | keoma.targino | catalogo, estoque, pedidos, compras, producao, painel | consultar_planejamento, editar_programacao, editar_parametros, publicar_programacao, aprovar_consolidacao, executar_sync_omie | — | sim |
| 17 | Aleksandro Pereira Ramos | Compras | aleksandro.ramos | compras, painel | — | — | sim |
| 18 | Alline de Paiva Perrupato | Pedidos, PCP e Faturamento | alline.perrupato | pedidos, producao, painel | consultar_planejamento, editar_programacao | — | sim |
| 19 | Angela Maria da Silva | Expedição | angela.silva | pedidos, painel | conferir_expedicao, conferir_camara | expedicao, camara_fria | sim |
| 20 | Cristiano Honorio de Almeida | Expedição | cristiano.almeida | pedidos, painel | conferir_expedicao, conferir_camara | expedicao, camara_fria | sim |
| 21 | Kevin Herlan Mamani Gonzales | Expedição | kevin.gonzales | pedidos, painel | conferir_expedicao, conferir_camara | expedicao, camara_fria | sim |
| 22 | Renato Rodrigues de Carvalho | Motorista | renato.carvalho | — escopo zero, pendente de definição | — | — | sim |
| 23 | Patricia Mellazo | Consultoria externa (fichas técnicas/POPs) | patricia.mellazo | catalogo | — | — | sim |

## Pendências registradas (não bloqueiam a v1; resolvem-se na ativação 49327a88 ou depois)

1. Conta de Renato (motorista) com escopo zero — definidor: aprovador/cliente.
2. Domínio do e-mail das contas padrão (ex.: @americangoodies… ou @pcp.local) — definir no provisionamento.
3. Keoma sem pontos registrados — PCP define pontos de expedição/faturamento quando as telas de conferência entrarem.
4. Revogação dos 4 perfis sintéticos @pcp.local da F1 — task 49327a88 (CA-A2/A3).

## Registro de versões

- v1 (2026-10-14): matriz inicial aprovada por Mr Cheney. Próximas alterações de escopo exigem nova versão datada (v2) com aprovador.
