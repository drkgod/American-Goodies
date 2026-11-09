# Evidência — SPEC-4-006 (chão de fábrica no celular e no tablet)

09/11/2026 · Skip v0.0.215 (ref ccda2bb) · tarefas em andamento (`[/]`).

## Feito
- Botões do kit com 44 px de altura no celular (`max-md:h-11`), seletores do kit com 44 px, campos com fonte de 16 px no celular (já era do kit; campos nativos da Preparação ajustados).
- `RodapeFixo`: a ação principal fica fixa no rodapé, na largura toda, com 48 px, abaixo de 768 px; no tablet volta ao lugar. Usado em Apontamentos ("Registrar"), Conferências ("Conferir expedição" e "Conferir câmara") e Recebimentos ("Registrar recebimento"). Na Preparação de pedidos, "Liberar para faturar" fica colado ao rodapé do cartão (`sticky`), porque a tela é uma lista de cartões.
- `PainelFiltros`: os filtros (ordem e ponto) abrem num painel pelo botão "Filtros" no celular.
- Listas em cartões no celular (Apontamentos: eventos; Conferências: registros; Recebimentos: parcelas) e tabela com colunas essenciais no tablet (a coluna Autor só no computador).
- `inputmode="decimal"` em todos os campos numéricos do sistema.
- Miolo de todas as telas com `overflow-x-clip` e `min-w-0`; a tabela do kit rola dentro do próprio quadro.
- Provas estáticas: CA-4-24, CA-4-25 e a parte estática do CA-4-26 (`green-*.txt`); regressão 284 de 284.

## Pendente
- Medição de `scrollWidth` em 360, 768 e 1280 px de cada rota e capturas das quatro telas: pedem sessão aberta (usuário de teste, CL-PEND-016). O script `tests/pcp/spec-4-006.medicao.mjs` roda quando houver acesso.
- O botão fixo "age sobre o cartão aberto" só se confirma em tela real; na Preparação foi usado o botão do cartão.
