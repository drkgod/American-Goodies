# Evidência — CA-4-03, CA-4-04 (telas) e CA-4-05 (conferências e consolidações)

Data: 09/11/2026 · Skip v0.0.205 (ref 8cb5fd8) · tarefa em andamento (`[/]`).

## O que foi feito
- `src/pages/Conferencias.tsx`: lê o estado do servidor (30 s e ao focar), mostra a fila (produzido e encaixotado vêm dos apontamentos gravados), registra a conferência de expedição e de câmara e a aprovação do PCP só por `src/services/pcp-producao.ts`. Sem constantes `*_DEMO`, sem "Simular nova conferência".
- `src/pages/Consolidacoes.tsx`: só leitura (ordem, conferências, aprovação, estado da ordem preparada); a "Fila de envio ao Omie (simulação)" saiu e não há botão de envio.
- `src/components/ProtectedArea.tsx`, `src/components/Layout.tsx`, `src/App.tsx`: guarda e menu aceitam alternativas ("conferir_expedicao|painel"); `DEMO_CONFERENCIA` e `ITENS_DEMO` foram removidos.
- Módulo puro novo `src/lib/pcp/conferencia-servidor.ts` (quem pode o quê, mensagens, fila, linhas de consolidação). A conta da fila continua sendo a de `conferencia.ts`; nenhuma regra mudou.
- Espelho em `07-sistemas/pcp/codigo/` (módulos, testes e `telas/`).

## Provas
- `green-CA-4-03.txt`, `green-CA-4-04.txt`, `green-CA-4-05.txt`; `regressao.txt`: 236 de 236.

## Limites
- Nada foi exercitado contra o servidor (sem usuário de teste, CL-PEND-016): visibilidade depois de reabrir o navegador, aprovação criando a ordem `preparada` e a negação por área nas rotas ficam para a SPEC-4-007.
- A tela de conferência aceita quem tem `painel` ou `conferir_expedicao`; quem só tem `painel` vê, mas só confere com ação, ponto e a área `conferir_expedicao`.
- Mensagens provisórias; a SPEC-4-004 centraliza.
