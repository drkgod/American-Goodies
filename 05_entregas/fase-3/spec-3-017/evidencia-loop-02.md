# Evidência — LOOP-02: perguntas prioritárias respondidas com fonte (SPEC-3-017)

Data: 30/10/2026 · Skip v0.0.195 (ref d5364f5), aplicada com QA verde na primeira tentativa e publicada; migration 0044 aplicada. Nenhuma chamada ao Omie.

## Construído
- **CA-3-45 medida e revisão:** `loop-perguntas.ts`; coleções `pcp_perguntas_prioritarias` (cadastro da gestão, versão nova a cada alteração) e `pcp_assistente_revisoes` (uma por pergunta feita, índice único). Rota `GET /backend/v1/pcp/assistente/loop` (configuração, prioritárias, perguntas do ciclo com ligação e decisão, medição do ciclo atual calculada na hora, ciclos com veredito; quem só tem `consultar_assistente` vê apenas as próprias perguntas e as prioritárias) e `POST .../loop/acao` com cinco ações: cadastrar prioritária (só a gestão), **ligar** a pergunta feita a uma prioritária ativa (por escolha de quem perguntou ou do validador; nunca por adivinhação), **revisar** (só o validador indicado; recusa exige motivo; uma revisão por pergunta), configurar e dar veredito. Medida = prioritárias respondidas com fonte E período e aceitas ÷ prioritárias feitas; ciclo sem prioritária = "não aplicável"; aceite sem fonte ou período não conta. Tela `/assistente/loop`.
- **CA-3-46 configuração desligada:** o loop nasce desligado (reaproveita `pcp_loop_config` e `pcp_loop_medicoes` com `loop = 'LOOP-02'`); ligar sem perguntas prioritárias ativas, linha de base, alvo, janela e validador é recusado (422); veredito só do validador, com o loop ligado, em ciclo terminado e com prioritária feita, e congela a medição. Ficha em `07-sistemas/pcp/loops.md`.

## Provas
- `node --test` (Node v24.22.1): suíte das SPECs 3-001 a 3-017, **179 de 179 passaram** (7 novos em `spec-3-017.test.mjs`).
  P3.17-01 (sem prioritária no ciclo: não aplicável), P3.17-02 (aceita sem fonte ou sem período: não conta; 1 de 4 = 25%), P3.17-03 (5 feitas, 4 aceitas: 80%; sem revisão e recusada não contam), P3.17-04 (ligar sem condições: recusado, com as cinco faltas listadas),
  além de cadastro só da gestão e versionado, ligação por escolha, recusa sem motivo, uma revisão por pergunta e ciclo controlado de demonstração (revisar, medir, veredito, congelamento).
- P3.17-05: as provas das SPECs 3-013 e 3-015 seguem verdes na suíte.

## Limites e pendências
- **Prova específica "falha de leitura da medição pausa e retoma" não construída:** a fonte é local (o próprio banco), então a medição fica "pendente" no módulo quando a fonte vem incompleta, mas não há rotina agendada que pause e retome.
- **Registro no Maestro:** este executor não tem ferramenta do Maestro; a configuração do LOOP-02 (desligado) está na ficha. Por isso a segunda tarefa segue em `[/]`.
- **Perguntas prioritárias, linha de base, alvo, janela e validador** não existem (CL-PEND-005). Sem elas o loop fica desligado.
- Só os ciclos com veredito ficam guardados; os demais são calculados na hora.
- Rotas e telas não exercitadas contra o servidor (sem conta de teste); os hooks repetem a lógica do módulo. Nenhuma conta real tem `validar_loop` ou `consultar_assistente` (matriz CL-003).
