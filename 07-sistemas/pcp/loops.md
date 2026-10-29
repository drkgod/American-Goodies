# Loops do Maestro — ficha de configuração

## LOOP-01 — alertas críticos tratados (SPEC-3-013) — DESLIGADO

- **Tipo:** loop · **Sistemas usados:** SPEC-3-010 (alertas) e SPEC-3-011 (tratamento) · **Agente:** assistente principal do cliente no Maestro.
- **Meta:** aumentar a proporção de alertas críticos tratados com ação registrada no ciclo. Prazo do ciclo: a janela definida pelo cliente (CL-PEND-005). Valor estimado: não informado.
- **Medida:** críticos tratados com ação registrada ÷ críticos gerados no ciclo. Ciclo sem crítico = "não aplicável" (nunca 100%). Tratado sem ação não conta.
- **Validação:** o assistente mede; um humano valida. Fonte independente: histórico de tratamento em `/alertas`. Baseline, alvo e unidade (proporção do ciclo): **a definir pelo cliente**. Cadência: uma medição por janela. Veredito: validador indicado pelo cliente (ação `validar_loop`).
- **Rota de leitura:** `GET /backend/v1/pcp/alertas/loop` (só leitura da medição). Tela: `/alertas/loop`.
- **Arranque (instrução permanente):** "No fim de cada janela, leia a medição do LOOP-01, mostre ao validador os alertas críticos ainda abertos e registre o veredito dele. Não trate alerta, não compre e não reprograme." Primeira tarefa: medir o primeiro ciclo depois da ativação e pedir o veredito. Autonomia: não. Limites: só leitura e registro do veredito. Teto de créditos: não definido. Pausa: fonte incompleta pausa a medição até a próxima rodada.
- **Condição para ligar (CL-PEND-005):** linha de base, alvo, janela e validador definidos pelo cliente. O sistema recusa ligar sem as quatro (422) e o estado inicial é desligado.
- **Estado do registro no Maestro:** esta ficha é o que o sistema entrega. O cadastro do loop dentro do Maestro (desligado) não foi feito por este executor, que não tem ferramenta do Maestro; fica para o consultor ou para a sessão final.
- **LOOP-02** (SPEC-3-017) poderá ser operado pelo mesmo assistente.
