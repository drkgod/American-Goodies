# Evidência — SPEC-4-005 (tabelas, campos, selos e avisos do kit)

09/11/2026 · Skip v0.0.209 (ref 0b54722) · tarefas em andamento (`[/]`), primeira etapa.

## Feito
- `src/lib/pcp/formato.ts`: número, moeda, quantidade com unidade, data e hora (São Paulo), "—" para valor desconhecido (CA-4-19).
- `textos.ts`: `GRUPOS_SELO` e `grupoDoEstado` (estado sem grupo mostra o selo neutro, CA-4-21).
- `Selo` e `Aviso` sobre o kit, só com os tokens do tema; tokens `--success`, `--warning` e `--info` (com `-foreground`, claro e escuro) em `main.css` e no Tailwind.
- Apontamentos: as duas janelinhas do navegador viraram um `dialog` ("Corrigir apontamento", com validação, "Salvar correção" e "Cancelar"); salvar mostra aviso flutuante (verde some em 4 s; vermelho fica até fechar).
- Regressão: 275 de 275 passam; 2 testes da varredura (CA-4-20 e CA-4-22) ficam como pendentes até a troca das telas.

## Falta (próximas etapas)
- Trocar as 18 tabelas em HTML puro e os 13 seletores nativos pelos do kit, com os números pelo `formato.ts`.
- Trocar as ~237 classes de cor fixa por `Selo`/`Aviso`/tokens e reduzir a um aviso de topo por tela.
- Trocar "Carregando…" (28 lugares) por `skeleton`; `alert-dialog` nas 4 ações; aviso flutuante nas demais telas que gravam.
- Capturas (usuário de teste, CL-PEND-016).
