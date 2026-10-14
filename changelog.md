# Changelog operacional

## 2026-10-08

- 2026-10-08 · [MCC/ETHOS] · **PUBLICAÇÃO EM PRODUÇÃO — Fase 1 no ar**: https://mcc-automacao-fabrica-98125.goskip.app (versões 0.0.59→0.0.61 publicadas; ref 4306849). Ajuste de entrega: VITE_POCKETBASE_URL mantido com o backend gerenciado (shrd00.internal.goskip.dev — mesmo do preview validado; tentativa de apontar ao domínio público gerou 405 do nginx em POST /api e foi revertida). Verificado em navegador real na URL de produção: login nativo ok, home com atalhos, painel consulta ativa (M043055 = 53 UN via API na sessão de produção). Pendência operacional remanescente para uso real: matriz nominal CL-003 (contas reais por pessoa) — perfis sintéticos @pcp.local continuam como acesso de teste até lá.
- 2026-10-08 · [MCC/ETHOS] · **FASE 1 CONCLUÍDA E VALIDADA — 18/18 (100%)**: aceite final do owner ("validado", 18:23) após regressão integrada R1–R8 8/8 (health, perfil, fontes ok 3344/1057/5393/0, visão de pedidos idêntica ao aceite 270/2647/44/373/10 com duplicados 0, catálogo com estado explícito, conferências 1057=1057 e 0=0, painel consistente, amostra autorizada M043055 = 53 UN idêntica ao aceite da SPEC-1-002) e ensaio de UI em navegador real (login, painel com 4 blocos, filtro pela UI, catálogo, home corrigida, logout). Todas as 5 SPECs com evidência e aceite humano; pendências herdadas registradas em fase.md (cadastro de produtos, matriz nominal CL-003, ficha técnica, publicação em produção). Versão final 0.0.59. Evidência consolidada: 05_entregas/fase-1/spec-1-005/relatorio-validacao-integrada.md.
- 2026-10-08 · [MCC/ETHOS] · **SPEC-1-005 COMPLETA — 3/3 tasks**: ee794334 (CA-P1/P2 — painel diário por área com filtros validados no servidor, resumo por unidade, oficiais por ID único, canal idêntico à visão; BUG-3 goja spread corrigido), ca5ece04 (CA-P3/P4 — lote antigo com aviso provado via migrations temporárias, estados diferenciados, permissão por bloco sem pistas) e 0b045738 (validação integrada — regressão 8/8 + ensaio de UI + aceite). Versões 0.0.54–0.0.59. Evidências em 05_entregas/fase-1/spec-1-005/.
- 2026-10-08 · [MCC/ETHOS] · **SPEC-1-004 COMPLETA — 3/3 tasks** (aceite do owner 17:10): catálogo sobre snapshots com recurso produtos no sync (lote vazio legítimo — fim por página incompleta), área catalogo em pcp_perfis (migration 0013), estados explícitos de incompletude, conferência estendida a produtos (0=0), divergência real de estoque (1055→1057) detectada e reconciliada com resync gen18, falso positivo de amostra por chave fixa corrigido (padrão POR RECURSO). Versões 0.0.48–0.0.53.
- 2026-10-08 · [MCC/ETHOS] · **SPEC-1-003 COMPLETA — 3/3 tasks** (aceite do owner 16:37): canal Nuvemshop 3344 (gen2, transições reais entre gerações com upsert idempotente), lote oficial Omie 5393/5393 (gen9, ativação atômica após falhas parciais gen5–8), 44 vínculos comprovados (codigo_pedido_integracao = numero_origem), duplicados_oficiais 0/5393, correção honesta da tese "referência ausente" (2.589 refs no lote completo; OH… = loja própria via Lunet). Versões 0.0.39–0.0.47.
- 2026-10-08 · [MCC/ETHOS] · **SPEC-1-002 CONCLUÍDA** (validação do owner 14:20): leitura real Omie (estoque 1055 reconciliado, conferência 1055=1055, credencial inválida sem retry, timeout 15s, retry/recuperação), DEFECT-1 corrigido (rate-limit como falha transitória), BUG-2 goja (JSON.parse('')) corrigido na revalidação.
- 2026-10-08 · [MCC/ETHOS] · **SPEC-1-001 CONCLUÍDA** (3/3, testes do owner 10:51/11:30/11:44): login nativo, proteção por área (migrations 0003/0004, perfis sintéticos Plano B), autorização no servidor, revogação em sessão (403 com token emitido antes), logout UI; organograma CL-003 transcrito (matriz v1.2 segue pendente).
- 2026-10-08 · [MCC/ETHOS] · CL-001 recebido (13:19) e CL-002 recebido (13:40): credenciais Omie e Nuvemshop registradas como secrets do projeto (nunca em repo); integrações reais provadas e reconciliadas.

## 2026-10-01

- 2026-10-01 · [MCC/ETHOS] · **SPEC-1-000 CONCLUÍDA** (3/3, testes do owner 14:56/15:13/15:23): base no Skip (coleções pcp_*, provider de demonstração, telas com fixtures), fundamento conferido antes das conexões (provas re-executadas do zero); leva de acesso liberada.
- Gerado o pacote final da Fase 1: 04_fase-atual/fase.md, seis SPECs com testes em 04_fase-atual/specs/ e 18 tasks abertas.
- Confirmado ambiente Skip/MCP do Skip/Skip Cloud.
- Ordem obrigatória: fundamento antes das conexões. SPEC-1-000 constrói e demonstra a base antes de conectar fontes.
- Validados formato dos cards e vínculo único task→SPEC; dados e permissões possuem prova e ponto de parada.
- Preservados os 15 UUIDs e a visibilidade recebidos do portal; três novas tasks de fundamento aguardam UUID.
- Criado o repositório privado [drkgod/American-Goodies](https://github.com/drkgod/American-Goodies), com a pasta operacional do cliente na raiz e branch main.
- Nenhuma task concluída; implementação, testes do produto e aceite humano pendentes.

## 2026-10-09

- Consultor autorizou encerrarF1 no recorte homologado e levar pendências àF2. Preservadas18 entregas e aceites anteriores; cadastro/matriz e três duplicatas seguem abertos com IDs existentes.
- Liberado pacoteF2:7 SPECs de sistema,TDD acoplado,29 tasks/29 UUIDs reais; revisões de fluxo, contrato,TDD, risco, decomposição e rastreabilidade concluídas. Validado fase-format:2, vínculo único e conteúdo operacional autossuficiente.
- Contratos antigos movidos para05_entregas/fase-1/contratos-homologados; nenhuma entrega/nota/sistema existente apagado. SomenteF2 permanece em 04_fase-atual.
- Nenhuma taskF2 implementada e nenhum teste novo do produto executado nesta liberação. A autorização documental não concede acesso nominal ou transaçãoERP; gates constam nasSPECs.

## 2026-10-13 — revisão documental publicada

- Revisadas sete SPECs e29 tasks; cada task continua ligada a exatamente uma SPEC/critério/prova.
- Especificadas transferência de saldo sem duplicação, resultado0 auditável sem autorização ERP0, firmeza com mapa aprovado pelo PCP e ação editar_programacao negada por padrão.
- Recuperação/falhas em mock separadas do caso real; guia técnico Skip/Cloud, QA e resultados dos testes incluídos nas SPECs.
- Fonte privada reconciliada à ordem operacional: recuperação antes do envio. Metadados dos29 cards preservados; duas descrições detalham pedidos firmes.
- Nenhum código/teste do produto executado. Ajustes aprovados pelo consultor e publicados no GitHub em13/10, branch main, com documentação incorporada às SPECs.

## 2026-10-14

- 2026-10-14 · [MCC/ETHOS] · **Task 51356fad (CL-003) — matriz nominal v1 registrada**: diretriz aprovada pelo owner (11:34) e conteúdo confirmado por formulário (11:54 — contas padrão nome.sobrenome; suplente Ronaldo espelhado dos gerentes; rascunho confirmado; exclusão: somente Limpeza). Matriz gravada em 05_entregas/fase-2/spec-2-000/matriz-nominal-v1.md (v1.1, commit d6b7cead — typo da conta da linha 4 corrigido cauau.silva→caua.silva) e acessos.md atualizado para "v1 APROVADA" (commit d3eb2ffa). fase.md marcado [/] (commits 4c67e43b/1d7d9571, truncamento do push reparado). Nenhuma conta criada/ativada e nenhum perfil Skip alterado — ativação/revogação é a task 49327a88. Estado: aguardando_teste_humano (revisão da matriz pelo aprovador).
- 2026-10-14 · [MCC/ETHOS] · Documentação de sistema da F1 entregue: 07-sistemas/pcp/catalogo.md e painel.md (contratos das SPECs 1-004/1-005 aceitas) — commit fddd51c0. Rascunho de proposta P2 (06_notas/proposta-fase-2-draft.md) mantido como histórico, superado pelo pacote oficial liberado em 09/10.
- 2026-10-14 · [MCC/ETHOS] · Task 51356fad concluída: matriz nominal v1.2 (CL-003) registrada e verificada; correções v1.1 (typo da conta da linha 4) e v1.2 (motorista Renato sem escopo na v1, decisão do aprovador em 12:04); teste humano aprovado pelo owner ("testei e aprovado", 12:02 BRT, com ajuste de escopo às 12:04); CA-A1 fechado; fase.md [x] (commit 2df11aa2). Próxima task elegível: 49327a88 (ativação das contas), que exige novo pedido do owner.
- 2026-10-14 · [MCC/ETHOS] · Reparo: o commit 3b488313 gravou este changelog com texto corrompido (palavras trocadas em entradas de 01–08/10); conteúdo restaurado ao fiel a partir de cópia local verificada contra o servidor (SHA f428dacfe417 pré-14/10). Nenhuma entrada de 14/10 foi perdida.
