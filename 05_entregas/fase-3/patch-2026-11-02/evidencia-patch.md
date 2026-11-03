# Patch de correção do consultor — 02/11/2026 (Skip v0.0.197, ref 32917f0, publicada 03/11)

Origem: instrução do consultor repassada pelo dono. Sem chamada ao Omie e sem ligar nenhuma gravação. Nenhuma tarefa, SPEC ou critério foi alterado; as tarefas continuam como estavam.

## Rotinas agendadas que consultam o Omie
Lista completa conferida em 03/11: nenhuma rotina agendada neste workspace (lista de tarefas agendadas vazia; nenhuma tarefa de sessão). No sistema, nenhuma rotina agendada própria (nenhum `cronAdd` entre os hooks). Resultado: nenhuma ativa.

## O que mudou
| Pedido | Feito | Prova |
|---|---|---|
| Apagar o hook temporário do catálogo dirigido | `pcp_catalogo_dirigido_run.js` apagado (junto com o segredo de reserva escrito nele). Os dois hooks `pcp_diag_*` também têm token de reserva/consulta ao Omie e NÃO foram apagados (fora do pedido): ver pendências. | QA do Skip sem o arquivo |
| Sincronização do catálogo | Respeita o bloqueio pela fonte (vale mesmo com a execução reiniciada); MISUSE_API_PROCESS conta como bloqueio; 401/403/outro 4xx é erro de acesso, nunca "não encontrado"; espera de 60 s antes de repetir a mesma consulta; uma rodada por vez (trava, 409 na segunda) | `spec-3-001-catalogo-sync-patch.test.mjs` (6) e `spec-3-016` ajustado |
| Saldo firme | Status desconhecido (ou data ausente, ou saldo inconsistente) bloqueia só a linha; o total soma as demais e vem com `total_parcial`; só vira null se nenhuma linha foi calculada | `spec-3-019-patch-regras.test.mjs` e `spec-2-001-pedidos-firmes` |
| Requisição | Quantidade zero/negativa/inválida ao alterar recusa com 422 (a rota já recusava; o contrato puro passou a recusar também) | idem |
| Ligação do pedido de compra | Confere a quantidade de cada item do pedido do Omie com a da compra (unidade de compra quando há fator); diferente = 422 `pedido_diferente` | idem |
| Gravações (pedido de compra, pedido de venda e volumes/frete) | A autorização guarda o conteúdo que o dono viu (`payload_autorizado`, migration 0045); a gravação recusa com 409 `pedido_alterado_apos_autorizacao`, sem chamar o Omie, e a autorização cai. Se a chave não desligar, o vínculo/gravação volta a `falhou_sem_efeito` e a nova tentativa fica liberada (com nova autorização do dono) | Leitura do código (hooks); sem prova de rota |
| Produção no servidor | Migration 0046 (programações, apontamentos, conferências, aprovações) e rotas `/backend/v1/pcp/producao/*`: publicar programação (versão, 409), registrar apontamento (por ponto, replay/409, retificação), registrar conferência (ação e ponto), aprovar consolidação (ação, conferências obrigatórias, motivo) que PREPARA a ordem em `pcp_transacoes_omie` (estado `preparada`), e ler o estado | `spec-3-019-producao-servidor.test.mjs` (módulo puro) |

## Provas
Fase 3 (inclui os arquivos novos) e o teste de pedidos firmes da fase 2: 206 de 206 (Node v24.22.1). Fases 1 e 2 completas: não reexecutadas (testes da fase 1 exigem conta de teste; os da fase 2 ficam no Skip). QA do Skip passou (v0.0.197); o Skip não roda testes.

## Limites (sem enfeitar)
- As rotas novas NÃO foram exercitadas contra o servidor: não há usuário de teste. Quando o dono criar, testo as telas e as rotas.
- As telas (Planejamento, Apontamentos, Conferências) ainda são as de demonstração; não foram ligadas às rotas novas. Hoje os dados da produção só entram pelas rotas. Ligar as telas é trabalho de tela que muda o aceite: vai para o consultor.
- A programação publicada guarda o que a tela validou (quantidade positiva, data, recurso); a conta de capacidade e calendário continua no módulo `planejamento.ts` do navegador, não no servidor.
- "Ordem de produção" foi entendida como a transação `concluir_op` preparada para o Omie (a mesma que a tela de envio da SPEC-3-002 autoriza). A criação da ordem dentro do Omie (IncluirOP) não existe no sistema e não foi inventada.
- Guarda das rotas novas: ação (e ponto, quando é apontamento/conferência), sem exigir área, porque a lista de áreas dessas rotas não está definida na matriz; confirmar com o consultor.
- Segue desligado: `omie_op_escrita`, `omie_pedido_compra_escrita`, `omie_pedido_venda_escrita`.
