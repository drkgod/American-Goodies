# Evidência — LOOP-01: alertas críticos tratados (SPEC-3-013)

Data: 29/10/2026 · Skip v0.0.190 (ref 18bb1cd), aplicada com QA verde e publicada; migration 0041 aplicada (coleções `pcp_loop_config` e `pcp_loop_medicoes` conferidas). A primeira tentativa de aplicar terminou com erro de rede do conector (a v0.0.189 foi consumida); a repetição passou sem alterar o conteúdo.

## Construído
- **CA-3-37 medida:** `loop-alertas.ts`. Proporção do ciclo = críticos tratados COM ação registrada ÷ críticos gerados no ciclo; tratado sem ação (ou com ação fora da lista) não conta; ciclo sem crítico = "não aplicável", nunca 100%; fonte incompleta = medição pendente. `GET /backend/v1/pcp/alertas/loop` calcula o ciclo atual na hora (janela definida pelo cliente, alinhada pelo calendário; sem janela, mês corrente marcado como provisório). Tela `/alertas/loop`.
- **CA-3-38 configuração e veredito:** o loop nasce desligado. `POST .../loop/config` (`editar_parametros`) grava linha de base, alvo, janela e validador (conta ativa com a ação `validar_loop`); pedir para ligar sem as quatro é recusado (422) e o loop continua desligado; apagar uma das quatro o desliga. `POST .../loop/veredito`: só o validador indicado, só com o loop ligado, só para ciclo já terminado e com crítico; mede, guarda e **congela** a medição junto com o veredito (autor e hora). O loop só mede, lembra e registra: não trata alerta, não compra, não reprograma.
- Ficha do loop em `07-sistemas/pcp/loops.md` (meta, medida, fonte, limites, instrução permanente, condição de ligar).

## Provas
- `node --test` (Node v24.22.1): suíte das SPECs 3-001 a 3-013, **149 de 149 passaram** (8 novos em `spec-3-013.test.mjs`).
  P3.13-01 (sem críticos: não aplicável), P3.13-02 (tratado sem ação não conta), P3.13-03 (10 gerados, 7 tratados: 70%), P3.13-04 (ligar sem condições: recusado, desligado), P3.13-05 (provas das SPECs 3-010 e 3-011 verdes),
  além de ciclo e fim do ciclo, fonte incompleta, veredito só do validador, loop ligado, medição aplicável, congelamento e recálculo.
- QA do Skip verde na v0.0.190.

## Limites e pendências
- **Registro no Maestro:** este executor não tem ferramenta do Maestro. A configuração do LOOP-01 (desligado) está na ficha `07-sistemas/pcp/loops.md`; cadastrá-lo no Maestro fica para o consultor ou a sessão final. Por isso a segunda tarefa segue em `[/]`.
- **Linha de base, alvo, janela e validador:** não existem (CL-PEND-005). Sem eles o loop fica desligado e a tela mostra o que falta.
- Só ciclos com veredito ficam guardados; os demais são calculados na hora, sem histórico de medições automáticas.
- Rotas e telas não exercitadas contra o servidor (sem conta de teste); os hooks repetem a lógica do módulo. Nenhuma conta real tem a ação `validar_loop` (matriz CL-003).
