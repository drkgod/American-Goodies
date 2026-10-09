# Evidência — SPEC-1-001 · CA-A1 (Plano B — perfis sintéticos)

- Data: 2026-10-08 · Executor: MCC (ETHOS)
- Task: 029ec0f7-b419-432d-b5de-5896097ea6a3 — "Confirmar acessos e papéis"
- Recorte: registro do mapa do projeto e dos perfis sintéticos de teste; nenhuma concessão real.

## Autorização

- Relatório de análise entregue em 2026-10-01 (`.adapta-cliente/analises/spec-1-001-ca-a1.md`),
  com as rotas A e B.
- Cliente autorizou em 2026-10-08 10:41 BRT, via formulário: "Rota B — Plano B com perfis
  sintéticos". Autorização posterior ao relatório, conforme o gate do método.

## O que foi registrado

1. `07-sistemas/pcp/acessos.md` (novo):
   - mapa do projeto Skip 62774 (id, org, hostname, URLs, rotas, coleções, migrations);
   - matriz CL-003 registrada como PENDENTE, com a proibição de concessão por suposição;
   - quatro perfis sintéticos de teste da SPEC, marcados como fixtures (não cargos aprovados).
2. Nenhuma alteração de código, telas, migrations, regras de acesso ou credenciais.

## Verificação automática

- Projeto Skip conferido via MCP: coleções `users, pcp_execucoes, pcp_lotes, pcp_dados,
  pcp_fontes` e migrations `updated_users` + `0002_pcp_fundamento` aplicadas — batem com
  `07-sistemas/pcp/fundamento.md`. Produção não publicada (isPublished=false).
- Varredura de segredos no conteúdo novo: sem credencial/token (scan executado antes do commit;
  ferramenta de scan do MCP indisponível neste repositório — revisão manual linha a linha).
- Diff do commit limitado a documentação e arquivos de controle (estado, changelog, STATUS,
  fase.md com a task em andamento).

## Limitações honestas

- CA-A1 segue **parcial** por desenho do Plano B: mapa registrado; matriz nominal (CL-003)
  pendente — o registro só fica completo quando a matriz for aprovada.
- Perfis sintéticos ainda não existem como contas/coleção: provisionamento é escopo da task
  seguinte (CA-A2/A3), conforme "uma task por vez".

## Teste humano solicitado

Conferir `07-sistemas/pcp/acessos.md` e confirmar: mapa correto; entendimento de que acesso real
segue bloqueado até a matriz; perfis sintéticos conforme a SPEC.
