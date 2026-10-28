# Evidência — Lista do que falta cadastrar no Omie (SPEC-3-001, CA-3-02)

Data: 28/10/2026 · Skip v0.0.172 (ref 594132b), publicada.

## Construído
- `src/lib/pcp/faltantes.ts`: contrato puro (RN-01) — compara ocorrências com o catálogo; catálogo não lido por inteiro
  devolve `catalogo_incompleto` e lista vazia; diferença entre leituras mostra quem foi cadastrado.
- `pocketbase/hooks/pcp_faltantes.js`: `GET /backend/v1/pcp/faltantes` (área `catalogo`). Só confia no catálogo se o lote
  ativo veio de uma leitura produto a produto concluída. Só leitura.
- `src/services/pcp-faltantes.ts` e card "O que falta cadastrar no Omie" em `/qualidade` (carregando, erro, vazio, aviso
  de catálogo incompleto, tabela com código, descrição e onde aparece).
- Correção na task anterior (`pcp_catalogo_sync.js`): linha do catálogo agora grava `produto_id`, `familia` e `ativo` 'S'/'N',
  o formato que `pcp_catalogo.js` lê (antes ia `ativo` booleano e sem `produto_id`).
- 4 testes de mesa em `tests/pcp/spec-3-001-faltantes.test.mjs`.

## Provas
- QA do Skip verde nas duas versões. A suíte não rodou (`qa.test.ran = false`); sem Node local. Teste de mesa refeito contra o
  código final nos 4 casos: cadastro faz sair da lista; mesmo código em 3 lugares vira 1 item; catálogo incompleto = lista vazia;
  ordem estável e código vazio ignorado.
- Publicação provada: ref publicada = versão atual (594132b).

## Limites e pendências
- A lista só cobre o **estoque**. Ficha e pedido não têm leitura guardada (pedidos importados só trazem cabeçalho); a tela e a
  resposta avisam isso em "Ainda não entram nesta lista". Entram quando o 90 dias real e as fichas forem lidos.
- Sem leitura real: depende da leitura do catálogo (chave do Omie bloqueada, CL-PEND-006). Conferência com 3 produtos reais fica
  para a validação final. Tela não foi vista no navegador (sem login de teste); só build e teste de mesa.
- Espelho em `07-sistemas/pcp/codigo/`: só o contrato e o teste desta task; endpoint, serviço, tela e o ajuste do
  `pcp_catalogo_sync.js` estão no Skip v0.0.172.
