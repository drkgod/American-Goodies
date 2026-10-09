# Evidência — SPEC-1-004 · Task 0113090a: Conferir a atualização do catálogo (CA-C1–C4)

- Data: 2026-10-08 · Executor: MCC (ETHOS)
- Task: 0113090a-8cf4-419e-bcc7-1b7b2986d1ce
- Versões do projeto Skip 62774: 0.0.52–0.0.53 (QA nativo ok)

## Implementação (conferência estendida ao catálogo)

- `conferir-fonte` agora aceita `recurso: produtos` (allowlist de conferência com endpoint/call
  por recurso): reconcilia `total_itens` do lote × `total_de_registros` do Omie;
- **0=0 é conferência válida** (cadastro vazio na conta — nenhuma divergência inventada);
- amostra de identidade: até 3 registros do lote conferidos por existência da própria chave
  no lote (padrão de chave POR RECURSO — estoque inclui local/unidade).

## Defeito corrigido na prova (honesto)

- 1ª versão da amostra usava o padrão de chave de `produtos` dentro do lote de `estoque` →
  falso positivo "3 registros sem identidade"; corrigido para padrão por recurso
  (`omie:estoque:app1:<id>:` com match prefixado) e reprovado: amostra limpa.

## Prova real (conta do cliente)

1. **Repetição de lote (CA-C4)**: resync de produtos (geração 2) → lote vazio ativado na 1ª
   página, replay sem duplicar (total 0 estável).
2. **Conferência do catálogo**: produtos **0=0 conferido** ("total do lote (0) =
   total_de_registros do Omie (0)").
3. **Reconciliação viva do estoque**: conferência acusou **divergência real** (lote 1055 ×
   Omie 1056 — o estoque mudou no ERP durante o dia); resync completo (geração 18, 22 páginas)
   → novo lote **1057 itens**, re-conferência **1057=1057 conferido**, amostra limpa; lote
   anterior substituído atomicamente (nenhuma janela sem lote ativo).
4. **Regressão**: pedidos NS 3344 (gen 2), oficiais 5393 (gen 9), produtos 0 (gen 2); health 200;
   autorização de catálogo/estoque intacta (403 sem área provado na task 8352cecc).

## Pendências honestas (dono: cliente)

- Cadastro de produtos do Omie VAZIO: cenários de inativo/unidade ausente/incompatível
  implementados (task ece1553b) e serão reprovados com dados reais quando o cadastro for
  povoado no ERP.
- Ficha técnica sem contrato exposto na API autorizada — estado explícito, sem mock.

## Teste humano (roteiro)

1. Conferir no painel (bloco estoque) o total 1057 e a hora da atualização (gen 18).
2. Catálogo continua com estado explícito de cadastro vazio.
3. (Opcional, após povoar o cadastro) produto com unidade/ativo e lote/horário; inativo com
   pendência; saldo com incompatibilidade sinalizada.
