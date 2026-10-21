# Evidência — Task e6aa4afa (Importar os 90 dias e recebimentos confirmados)

SPEC-2-001 CA-D4 · 21/10/2026 · recorte do executor · executor MCC (ETHOS)

## Contrato (TDD 7/7 GREEN de primeira — oráculos da SPEC)
- src/lib/pcp/importacao-90d.ts — máquina de importação atômica:
  - **janela90**: D-89..D inclusive (2026-10-21 → 2026-07-24..2026-10-21); data externa excluída na importação (fora=1).
  - **registrarPagina**: chave = aplicativo+recurso+documento+linha; replay não duplica (novas=1, repetidas=1); página registrada limpa falha anterior.
  - **marcarPaginaFalha + ativarLote**: página 2 com falha → ativação RECUSADA com aviso "lote anterior permanece ativo; importação incompleta não ativa"; completando as páginas → ativação ok; geração ≤ ativa RECUSADA.
  - **normalizarLinha**: IDs em texto (produto_id numérico → '123'), unidade null preservada (nunca vira UN), quantidade finita ≥ 0, data ISO validada.
  - **restanteReceber** (compras_a_receber): aprovada 20 KG recebida 5 KG dentro do horizonte → 15 KG; cancelada e fora do horizonte → não elegíveis (0); replay por pedido+linha mantém 15; status desconhecido → null BLOQUEIA (nunca 0); unidade ausente bloqueia; recebida > pedida bloqueia (nunca negativa nem acima do pedido).
- Card visível na tela /apontamentos. Skip v0.0.143, produção ref 7084d96 provada.

## Uso real (pendente — não bloqueia o recorte)
- Mapa REAL aprovado pelo PCP em 07-sistemas/pcp/contratos-fase-2.md (status elegíveis/excluídos, campo de data operacional).
- Cadastro Omie 4e0fcf1c (listagem de produtos vazia — sincronização por listagem não trará registros até o cadastro; consulta dirigida por código é viável).
- Fixtures sintéticas NÃO aprovam a regra empresarial (regra da SPEC).

## Teste humano (pendente)
- Login na produção → Apontamentos → card "Importação 90 dias e restante a receber — oráculos CA-D4 (e6aa4afa)": janela 2026-07-24 → 2026-10-21 · página 1: 1 nova, 1 repetida, 1 fora · página 2 com falha → recusada com aviso · geração completa → ativada · restante 15 KG · desconhecido null (bloqueia) · cancelada/fora 0.
