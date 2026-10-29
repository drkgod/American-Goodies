# Evidência — Tratamento dos alertas (SPEC-3-011)

Data: 29/10/2026 · Skip v0.0.187 (ref 0baa9a6), aplicada com QA verde e publicada; migration 0039 aplicada. O conector do Skip oscilou durante a construção: dois arquivos e um patch gravados na hora se perderam e foram regravados e conferidos pelo status antes de aplicar; a aplicação falhou três vezes por falta de resposta do conector e passou na quarta, sem alteração do conteúdo.

## Construído (no Skip)
- **CA-3-33 ciclo e histórico:** `tratamento-alertas.ts`; campos novos em `pcp_alertas` (versão, responsável, alerta anterior, ação, texto, tratado por/em) e coleção `pcp_alertas_historico` (só inclusão). Rotas `POST /backend/v1/pcp/alertas/assumir` (aberto → em análise, responsável gravado, versão esperada em transação: quem chega depois recebe 409), `POST .../tratar` (só o responsável; **sem ação registrada, 422**; "alerta indevido" exige motivo; "outra" exige descrição; grava autor e hora) e `GET .../historico` (segue a ligação ao alerta anterior). Ações: compra solicitada, ordem reprogramada, fornecedor contatado, pedido liberado, risco aceito, alerta indevido, outra. Tratar só registra: nada é comprado, reprogramado, publicado ou lançado no financeiro.
  Reabertura: a rodada (SPEC-3-010) passou a atualizar também o alerta em análise; se a condição volta depois de tratado, nasce alerta novo com `anterior_id` e a ocorrência seguinte.
- **CA-3-34 por área, agrupado, regra desligável:** destinatário por tipo (estoque, produção, divergência → área planejamento/PCP; compra e preço → compras; pedido → faturamento; quem tem as três áreas = gestão). `GET /backend/v1/pcp/alertas` devolve só os da área; assumir, tratar e histórico negam alerta de outra área com a mesma recusa 403 de quem não tem a ação. Tela `/alertas` agrupa por tipo e item; menu mostra o contador de abertos da área (`GET .../alertas/contador`). `POST .../alertas/regra` (`editar_parametros`) liga e desliga a regra por tipo (`pcp_alertas_regras`): desligada, a rodada para de gerar; alertas e histórico existentes ficam, e a mudança entra no histórico.

## Provas
- `node --test` (Node v24.22.1): suíte das SPECs 3-001 a 3-011, **133 de 133 passaram** (8 novos em `spec-3-011.test.mjs`).
  P3.11-01 (tratar sem ação: 422; indevido/outra sem texto: 422), P3.11-02 (PCP tenta alerta de preço: 403 idêntico ao de quem não tem a ação), P3.11-03 (ruptura assumida por Compras e tratada como "compra solicitada" com autor e hora; histórico só cresce), P3.11-04 (duas pessoas assumem juntas: uma consegue, a outra 409), P3.11-05 (regra desligada para de gerar e mantém o que existe; provas da SPEC-3-010 verdes),
  além de destinatário por tipo, gestão, reabertura ligada ao anterior, agrupamento e contador por área.
- QA do Skip verde na v0.0.187.

## Limites e pendências
- Rotas e telas não exercitadas contra o servidor (sem conta de teste); os hooks repetem a lógica do módulo e só o módulo tem teste automático. Regressão das fases 1 e 2 não reexecutada.
- **Matriz de acesso (CL-003):** a ação `tratar_alerta` existe, mas nenhuma conta real a recebeu (matriz não aprovada). "Gestão" foi definida como quem tem as três áreas; se o dono quiser outro critério, muda na matriz.
- A área "PCP" corresponde à área de trabalho `planejamento` do sistema.
- Alertas antigos da SPEC-3-010 sem versão no banco são tratados como versão 1.
- Alerta que sai da situação continua aberto até alguém tratá-lo (não há fechamento automático).
- Nada é enviado fora da plataforma (sem WhatsApp ou e-mail).
