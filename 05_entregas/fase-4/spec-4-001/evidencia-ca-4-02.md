# Evidência — CA-4-02 (apontamentos pelo servidor)

Data: 09/11/2026 · Skip v0.0.204 (ref f957670) · tarefa em andamento (`[/]`).

## O que foi feito
- `src/pages/Apontamentos.tsx` lê a programação e os eventos por `GET /backend/v1/pcp/producao/estado` e grava por `POST .../apontamento/registrar`, só pelo cliente `src/services/pcp-producao.ts`.
- Módulo puro novo `src/lib/pcp/apontamento-servidor.ts` (identificador, assinatura, formulário, mensagens, resumo); espelho em `07-sistemas/pcp/codigo/` com a tela em `telas/`.
- O identificador do evento nasce na tela e é reaproveitado até o servidor responder; reenvio devolve "já registrado" (replay) e não duplica.
- Releitura a cada 30 s e ao focar; falha de leitura mostra "Não foi possível carregar" e "Tentar de novo", nunca dado fixo.
- Removidos da tela os blocos de oráculos com dados fixos e as constantes `*_DEMO`; os módulos e testes da fase 2 continuam.

## Provas
- `green-CA-4-02.txt`: 8 testes CA-4-02 passando (inclui a varredura da tela, CA-4-05).
- `regressao.txt`: 225 de 225.

## Limites
- Não foi exercitado contra o servidor (sem usuário de teste, CL-PEND-016). "Continua visível depois de fechar e abrir o navegador" é provado na SPEC-4-007.
- Os nomes dos pontos vêm do perfil (`obterPerfil`); a ficha técnica real não existe ainda, então a tela não calcula "previsto" nem diferença.
- Mensagens provisórias; a SPEC-4-004 centraliza.
