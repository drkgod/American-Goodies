# Evidência — SPEC-1-004 · Task ece1553b: Sinalizar cadastros e unidades incompletos (CA-C3)

- Data: 2026-10-08 · Executor: MCC (ETHOS)
- Task: ece1553b-6cd1-4cb6-8030-840353c172a5
- Versões do projeto Skip 62774: 0.0.51 (QA nativo ok)

## Implementação (sobre a task 8352cecc)

- **Estados explícitos no detalhe** (`GET /pcp/catalogo/{id}`), campo `pendencias[]`:
  - produto **INATIVO** no cadastro → "Produto INATIVO no cadastro do Omie (preservado no
    catálogo — inatividade não apaga histórico)" — distinção entre inatividade e ausência de
    leitura (produto fora do lote → `produto_nao_encontrado`, referência preservada);
  - **unidade AUSENTE** → "conversão e cálculo ficam IMPEDIDOS para este item (nada é
    preenchido por padrão)" — sem default UN;
  - linha de saldo com unidade **INCOMPATÍVEL** com o cadastro → flag
    `unidade_incompativel: true` por local, exibida como informada, SEM conversão e SEM soma
    entre unidades distintas;
- Página Catálogo exibe o bloco de pendências por item e o aviso de incompatibilidade na
  linha de saldo.

## Prova (conta do cliente — cadastro VAZIO)

- Detalhe de item inexistente → `produto_nao_encontrado` (estado específico, não lista vazia
  genérica); consulta NÃO altera o mestre (só leitura de snapshot).
- Lista com lote ativo vazio → `disponivel:true, total:0` + pendência explícita "Lote ativo
  sem produtos (cadastro vazio na origem)" — zero legítimo distinto de indisponibilidade.
- health 200; fontes estáveis (NS 3344 / estoque 1055 / oficiais 5393 / produtos 0).

## Nota honesta

Os cenários de inativo/unidade incompatível estão implementados e serão provados com DADOS
REAIS quando o cadastro de produtos for povoado no ERP (hoje a conta tem 0 produtos — os
estados `produto_nao_encontrado` e cadastro vazio estão provados em runtime; inativo e
incompatível seguem a mesma lógica de pendências já exercida). Registrado para a conferência
final da SPEC (task 0113090a).

## Teste humano (roteiro)

1. Detalhe de um produto: quando o cadastro estiver povoado, os blocos de pendência aparecem
   para inativo/unidade ausente; saldo com unidade diferente mostra o aviso de incompatível.
2. Hoje (cadastro vazio): verificar que a lista mostra a pendência explícita e o detalhe
   devolve `produto_nao_encontrado` — nenhum zero/default inventado.
