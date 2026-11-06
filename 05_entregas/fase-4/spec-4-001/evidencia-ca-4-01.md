# SPEC-4-001 · CA-4-01 e CA-4-04 (parcial) — Planejamento pelo servidor (06/11/2026, Skip v0.0.203)

- Módulo novo `planejamento-servidor.ts`: transforma a versão aprovada dos parâmetros em recursos e calendário (dias de produção por recurso), decide se "Publicar" habilita e traduz 200/409/422/403. Testes `CA-4-01` (4) e `CA-4-04` (1) em `spec-4-001.test.mjs`; RED/GREEN em `green-CA-4-01.txt` e `green-CA-4-04.txt`; regressão `regressao.txt` (216 de 216).
- Tela `/planejamento`: lê `GET /parametros` e `GET /producao/estado`, relê a cada 30 s e ao voltar o foco, publica por `POST /producao/programacao/publicar` (versão esperada; 409 recarrega). Sem constante `*_DEMO` e sem `publicarProgramacao` local. Erro de carga mostra "Não foi possível carregar" com "Tentar de novo".
- `/parametros`: o recurso ganhou "Dias de produção" (Dom a Sáb), gravado em `dias_producao` dentro do JSON de parâmetros (sem migration). Parâmetros já aprovados antes não têm o campo: "Publicar" fica desabilitado até o PCP reaprovar com os dias.
- Guarda de área nas rotas: publicar = `planejamento`; apontar = `apontar_producao`; conferir = `conferir_expedicao`; aprovar = `painel`; ler = qualquer uma das quatro. Ação e ponto continuam exigidos. Resposta única 403.
- Removido da tela de Planejamento o bloco de reprogramação de demonstração (dados fixos). O módulo `reprogramacao.ts` e os testes da fase 2 ficam.

## Limites
- Nada foi exercitado contra o servidor (sem usuário de teste, CL-PEND-016). Duas sessões vendo a mesma versão em até 30 s e a negação por área ficam para a SPEC-4-007.
- O CA-4-04 só fecha quando as outras rotas e a tela de Conferências estiverem ligadas (tarefas seguintes).
- As áreas `planejamento`, `apontar_producao`, `conferir_expedicao` e `painel` precisam existir nos perfis reais; até o dono aprovar a matriz (CL-003), nenhuma conta real as tem para essas rotas e a publicação real continua impossível.
- Espelho: módulos, testes e telas em `07-sistemas/pcp/codigo/`; hooks só no Skip.
