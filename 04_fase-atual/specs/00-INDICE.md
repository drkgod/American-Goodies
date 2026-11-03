# Fase 4 — Produção no servidor, acabamento do sistema e validação final

**Liberada em 03/11/2026 (P6).** A construção da fase 3 terminou em 30/10, e o patch de correção de 02/11 foi aplicado em 03/11 (Skip v0.0.197). A fase 4:
- liga as telas de produção às rotas do servidor que o patch criou e leva essa produção aos relatórios, aos alertas e à exportação;
- dá ao sistema a cara e a linguagem da American Goodies, no computador, no tablet e no celular;
- traz da fase 3 o uso dos dados reais do Omie e a sessão de validação final com a equipe.

São 7 SPECs e 21 tarefas. A fase 5 não tem tarefas.

## Como executar

- Construa as tarefas em sequência, na ordem do `fase.md`, sem teste no meio e sem pedir autorização antes de cada uma.
- Cada tarefa de construção fecha quando passa o recorte de prova dela (o critério da SPEC, com `--test-name-pattern`) e a evidência fica em `05_entregas/fase-4/spec-4-NNN/`. Há três exceções:
  - "Montar 3 propostas de visual…" fecha quando as propostas forem entregues ao dono;
  - "Preparar a sessão final…" fecha com a preparação pronta;
  - "Fazer a sessão de validação final…" fecha com o aceite registrado.
- **Ordem:** a SPEC-4-002 (identidade visual) vem depois da 4-006, porque as propostas mostram o menu novo e os componentes do kit. Se o logo e as cores (CL-PEND-015) chegarem antes, guarde os arquivos e siga a ordem.
- **Ponto de aprovação:** há um só antes da sessão final, quando o dono escolhe uma das 3 propostas de visual (CL-008). Enquanto ele não responde, siga com as tarefas da SPEC-4-007 que não dependem do visual.
- **Teste com o cliente:** é a sessão de validação final (SPEC-4-007). Cada SPEC lista em "Teste humano do cliente" o que cada área confere nessa sessão.
- **Fase 3:**
  - As 46 tarefas da fase 3 continuam em `05_entregas/fase-3/fase.md`.
  - As SPECs 3-001 a 3-017, em `05_entregas/fase-3/specs/`, continuam valendo como contrato do que foi construído.
  - A SPEC-3-018 foi substituída pela SPEC-4-007 e não deve ser executada.
  - Quando chegar a entrada que segurava uma tarefa da fase 3, o Maestro completa a parte pendente pela SPEC de origem, registra na linha `> ` e marca `[x]` quando as provas passarem (regra da SPEC-4-007).
- **Bloqueios:** dado do cliente ausente ou Omie bloqueado deixa pendente só a parte afetada. Construa o restante, registre em `06_notas/` e no `STATUS.md` e siga para a próxima tarefa.

## Ordem das SPECs

| Ordem | SPEC | Entrega | Origem |
|---|---|---|---|
| 1 | [SPEC-4-001](spec-4-001-producao-gravando-no-servidor.md) | Registros de teste e demonstração separados dos reais; planejamento, apontamentos, conferências e aprovação gravando no servidor; produção nos relatórios, nos alertas e na exportação; arquivos de diagnóstico com chave apagados | Patch de 02/11 (limites em `05_entregas/fase-3/patch-2026-11-02/`); CA-3-05; RQ-002 |
| 2 | [SPEC-4-003](spec-4-003-menu-e-tela-inicial.md) | Menu lateral por área, com ícones e versão para celular; cabeçalho; tela inicial por pessoa | P6 |
| 3 | [SPEC-4-004](spec-4-004-linguagem-da-operacao.md) | Telas sem bastidor de teste, sem código interno e com a língua da operação | P6 |
| 4 | [SPEC-4-005](spec-4-005-componentes-e-avisos.md) | Tabelas, seletores, confirmações, carregamento, selos e avisos do kit | P6 |
| 5 | [SPEC-4-006](spec-4-006-celular-e-tablet.md) | Telas do chão de fábrica usáveis no celular e no tablet | P6; escopo (uso na cozinha, expedição e almoxarifado) |
| 6 | [SPEC-4-002](spec-4-002-identidade-visual.md) | Identidade visual da American Goodies: tema, login, título, ícone e português | P6; CL-008; CL-PEND-015 |
| 7 | [SPEC-4-007](spec-4-007-dados-reais-e-validacao-final.md) | Leituras reais do Omie, telas e rotas provadas no servidor, pendências da fase 3 e sessão de validação final | SPEC-3-018 e pendências da fase 3; RQ-014; CL-007; CL-003; CL-PEND-006; CL-PEND-011; CL-PEND-016 |

## Regras comuns a todas as SPECs

1. **Ambiente.** O sistema é o projeto Skip 62774 (mcc automação fabrica), com MCP do Skip e Skip Cloud. Não criar outro projeto nem outro banco. Ler o código, as migrations e as coleções atuais antes de alterar. Antes de migration ou hook, consultar `skip_cloud_migrations_guide` e `skip_cloud_hooks_guide`. Depois de cada recorte, `skip_project_apply_changes` roda o QA: conferir cada etapa e `qa.test.ran`.
2. **Onde está o código.**
   - O código vivo está no projeto Skip 62774.
   - O submódulo `07-sistemas/mcc-automacao-fabrica` parou em 01/10 (v0.0.1) e não é referência.
   - Ao terminar cada tarefa, espelhe em `07-sistemas/pcp/codigo/` todo arquivo que ela criou ou alterou (telas, componentes, tema, hooks e migrations), sem segredo.
   - Use o mesmo padrão do espelho atual: o arquivo direto em `codigo/`, com o nome original (por exemplo, `codigo/Apontamentos.tsx`). Se dois arquivos tiverem o mesmo nome, use o caminho a partir de `src/` com hífens (por exemplo, `codigo/components-Selo.tsx`).
3. **Regras do negócio não mudam.** Nas SPECs 4-002 a 4-006, só mudam a aparência, a navegação, os textos e o uso no celular. Nenhuma regra, cálculo, permissão, rota do servidor ou gravação no Omie muda. Se uma mudança visual parecer exigir mudança de regra, pare essa parte, registre em `06_notas/` e siga com o restante.
4. **Kit de componentes.**
   - O sistema usa o kit shadcn/ui (`@/components/ui/*`) com Tailwind e os ícones `lucide-react`.
   - Use os componentes do kit que já estão no projeto.
   - Se faltar algum (`table`, `select`, `dialog`, `alert-dialog`, `sheet`, `sidebar`, `skeleton`, `sonner`, `collapsible`, `tooltip`, `command`, `popover`), adicione-o pelo padrão do kit, sem biblioteca nova de interface.
5. **Tema por tokens.**
   - Cor, fonte, raio e espaçamento vêm das variáveis CSS do tema, no `:root` do arquivo de estilos global importado por `src/main.tsx` (hoje `src/main.css`), nunca de valor escrito direto na tela.
   - Texto e botões cumprem contraste mínimo de 4,5:1 (WCAG AA).
   - O sistema não ganha modo escuro nesta fase.
6. **Acesso.** O servidor confere conta ativa, área, ação e ponto em cada chamada, como na fase 3. O menu e a tela inicial só mostram o que a pessoa acessa. Isso é conforto visual: a proteção continua no servidor.
7. **Dados.**
   - Negócio em America/Sao_Paulo e auditoria em UTC.
   - Valor desconhecido fica pendente, nunca zero.
   - Dado de demonstração, e tudo o que os usuários de teste gravarem, fica marcado e separado do real no servidor. A tela mostra a marca "Dados de demonstração" onde ele aparece.
8. **Omie.** As regras de leitura e escrita da fase 3 continuam:
   - um sub-lote por vez, com pausa e retomada;
   - bloqueio (HTTP 425 ou consumo redundante) para a rotina e mantém o último dado válido;
   - nada chama o Omie até o dono avisar que a chave foi liberada;
   - toda gravação tem chave própria, desligada (`omie_op_escrita`, `omie_pedido_compra_escrita`, `omie_pedido_venda_escrita`; `omie_recebimento_escrita` em revisão), e só liga com a autorização explícita do dono, uma por vez, com a condição do checklist cumprida;
   - a primeira gravação de cada tipo é feita com o dono presente e conferida no Omie logo depois.
9. **Provas.**
   - RED antes do comportamento, GREEN e regressão.
   - Testes Node nativos (`node:test` e `assert/strict`) em `tests/pcp/spec-4-NNN.test.mjs`, chamando o mesmo módulo da aplicação, com o código do critério no nome de cada teste.
   - Cada tarefa roda o próprio recorte com `node --test --test-name-pattern "CA-4-NN"` e guarda a saída em `green-CA-4-NN.txt`.
   - Para aparência e celular, a prova é a verificação automática descrita na SPEC, mais as capturas de tela na evidência.
   - Build, lint e QA do Skip não substituem prova de aceite.
   - Registre comando, versão do Skip e saída na evidência.
   - Ao fim de cada SPEC de 4-001 a 4-006, `node --test tests/pcp/` (fase 3, patch e fase 4) passa. A regressão completa das fases 1 e 2, que precisa do usuário de teste, roda na SPEC-4-007.
10. **Reversão.** Cada SPEC é publicada numa versão própria do Skip. Voltar a versão desfaz a mudança de tela. Migrations só aditivas; não apagar coleção nem evento.
11. **Segurança e privacidade.** Segredo nunca no navegador, no Git, em documento, em captura de tela ou em log. Nas capturas da evidência, use dado de demonstração ou cubra nome de cliente, contato de fornecedor e valor financeiro.

## Fora desta fase

- Regra de negócio nova, tela nova (fora da tela inicial e das janelas que trocam os pop-ups) e conector novo.
- Modo escuro, aplicativo instalado no celular e funcionamento sem internet.
- Emissão de nota fiscal, pagamento ou lançamento financeiro, e compra ou produção decidida pela IA.
- Leitura de nota fiscal de entrada real e gravação do recebimento no Omie (SPEC-3-007, CA-3-22). Continuam em revisão até a resposta do CL-PEND-007. Depois dela, o consultor manda uma emenda.
- Marcador da Lunet nos pedidos (SPEC-3-008, CA-3-25). Depende do CL-PEND-003 e fica como pendência da fase 3.
- Os ajustes de regra registrados como dívida em 03/11, que voltam ao consultor depois da sessão final, se a equipe confirmar:
  - alerta marcado como indevido entra na conta de tratados;
  - a duplicata de pedido manual só é detectada pela referência, que vem vazia nos pedidos reais;
  - o perfil de "gestão" é deduzido de quem tem três áreas;
  - o assistente tem 4 ferramentas.
