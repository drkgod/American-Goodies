# Evidência — SPEC-4-003 (menu por área e tela inicial)

09/11/2026 · Skip v0.0.207 (ref bdb4d6a) · tarefas em andamento (`[/]`).

- `src/lib/pcp/menu.ts`: 25 itens (grupo, rótulo, rota, área, ícone), filtro por área, saudação por horário de São Paulo, títulos.
- `Layout.tsx` (sidebar do kit, recolhe para ícones; painel lateral no celular), `Index.tsx` (tela inicial), `ProtectedArea.tsx` (alternativas "a|b" e "*"), `App.tsx` (`/` com "*").
- Provas: `green-CA-4-11.txt`, `green-CA-4-12.txt`, `green-CA-4-14.txt`, `regressao.txt`.
- Pendente: medição de `scrollWidth` em 360 e 1280 px e capturas com perfis de teste (CL-PEND-016). Ícones: todos existem no lucide-react 0.577, sem troca.
